import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import { hasConfirmedAppointmentOverlap } from "@/lib/booking/conflicts";
import { ensurePatientProfile } from "@/lib/booking/patients";
import {
  sendDoctorNewBookingNotification,
  sendPatientBookingConfirmation,
} from "@/lib/emails/booking-emails";
import { createCalendarEvent } from "@/lib/google-calendar/events";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/validation/turnstile";
import { site } from "@/config/site";

const createBookingSchema = z.object({
  locale: z.enum(["el", "en"]).default("el"),
  appointmentTypeId: z.string().uuid(),
  startAt: z.string().datetime(),
  patientName: z.string().trim().min(2).max(120),
  patientEmail: z.string().trim().email().max(180),
  patientPhone: z.string().trim().min(6).max(40),
  patientNote: z.string().trim().max(1000).optional().default(""),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const result = createBookingSchema.safeParse(json);
  const fallbackIdentifier = result.success
    ? `create:${result.data.patientEmail.toLowerCase()}`
    : "booking:create";
  const rateLimit = await checkRateLimit({
    route: "booking:create",
    identifier: getRequestIdentifier(request, fallbackIdentifier),
    limit: 5,
    windowSeconds: 60 * 10,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid booking details." },
      { status: 400 },
    );
  }

  const input = result.data;
  const captcha = await verifyTurnstileToken(
    input.captchaToken,
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for"),
  );

  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Captcha verification failed." },
      { status: 400 },
    );
  }

  const availableDays = await getAvailabilityForAppointmentType(input.appointmentTypeId);
  const selectedSlot = availableDays
    .flatMap((day) => day.slots)
    .find((slot) => slot.startAt === input.startAt);

  if (!selectedSlot) {
    return NextResponse.json(
      { error: "This appointment time is no longer available." },
      { status: 409 },
    );
  }

  const supabase = createAdminClient();
  const hasOverlap = await hasConfirmedAppointmentOverlap({
    startAt: selectedSlot.startAt,
    endAt: selectedSlot.endAt,
  });

  if (hasOverlap) {
    return NextResponse.json(
      { error: "This appointment time is no longer available." },
      { status: 409 },
    );
  }

  const patientId = await ensurePatientProfile({
    name: input.patientName,
    email: input.patientEmail,
    phone: input.patientPhone,
  }).catch(() => null);

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientId,
      appointment_type_id: input.appointmentTypeId,
      patient_name: input.patientName,
      patient_email: input.patientEmail,
      patient_phone: input.patientPhone,
      patient_note: input.patientNote || null,
      start_at: selectedSlot.startAt,
      end_at: selectedSlot.endAt,
      status: "confirmed",
    })
    .select("id,start_at,end_at,cancel_token,reschedule_token")
    .single();

  if (appointmentError) {
    if (appointmentError.code === "23P01") {
      return NextResponse.json(
        { error: "This appointment time is no longer available." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Could not create appointment." },
      { status: 500 },
    );
  }

  await supabase.from("analytics_events").insert({
    event_type: "booking_completed",
    metadata: {
      appointment_id: appointment.id,
      appointment_type_id: input.appointmentTypeId,
      start_at: appointment.start_at,
      end_at: appointment.end_at,
    },
  });

  const [appointmentTypeResult, doctorProfileResult, notificationSettingsResult] =
    await Promise.all([
    supabase
      .from("appointment_types")
      .select("name_el,name_en")
      .eq("id", input.appointmentTypeId)
      .maybeSingle(),
    supabase
      .from("doctor_profile")
      .select("clinic_name,email")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("notification_settings")
      .select("patient_confirmation_email_enabled,doctor_new_booking_email_enabled")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
  ]);

  const appointmentTypeName =
    input.locale === "el"
      ? appointmentTypeResult.data?.name_el
      : appointmentTypeResult.data?.name_en;
  const clinicName = doctorProfileResult.data?.clinic_name ?? "Dental Clinic";
  const doctorEmail = doctorProfileResult.data?.email;

  if (appointmentTypeName && doctorEmail) {
    const calendarEventId = await createCalendarEvent({
      appointmentId: appointment.id,
      appointmentTypeName,
      patientName: input.patientName,
      patientEmail: input.patientEmail,
      patientPhone: input.patientPhone,
      patientNote: input.patientNote,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
    }).catch(() => null);

    if (calendarEventId) {
      await supabase
        .from("appointments")
        .update({ google_event_id: calendarEventId })
        .eq("id", appointment.id);
    }

    const emailInput = {
      locale: input.locale,
      clinicName,
      doctorEmail,
      appointmentTypeName,
      patientName: input.patientName,
      patientEmail: input.patientEmail,
      patientPhone: input.patientPhone,
      patientNote: input.patientNote,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
      cancelUrl: `${site.url}/${input.locale}/booking/cancel?token=${appointment.cancel_token}`,
      rescheduleUrl: `${site.url}/${input.locale}/booking/reschedule?token=${appointment.reschedule_token}`,
    };

    const notifications = notificationSettingsResult.data;
    const emailTasks = [];

    if (notifications?.patient_confirmation_email_enabled ?? true) {
      emailTasks.push(sendPatientBookingConfirmation(emailInput));
    }

    if (notifications?.doctor_new_booking_email_enabled ?? true) {
      emailTasks.push(sendDoctorNewBookingNotification(emailInput));
    }

    await Promise.allSettled(emailTasks);
  }

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
    },
  });
}
