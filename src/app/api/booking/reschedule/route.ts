import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import { hasConfirmedAppointmentOverlap } from "@/lib/booking/conflicts";
import {
  sendDoctorRescheduleNotification,
  sendPatientRescheduleConfirmation,
} from "@/lib/emails/booking-emails";
import { updateCalendarEvent } from "@/lib/google-calendar/events";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().trim().min(32).max(128),
  locale: z.enum(["el", "en"]).default("el"),
  startAt: z.string().datetime(),
});

type AppointmentRow = {
  id: string;
  appointment_type_id: string | null;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_note: string | null;
  start_at: string;
  end_at: string;
  reschedule_token_expires_at: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  google_event_id: string | null;
  appointment_types:
    | {
        name_el: string;
        name_en: string;
      }
    | Array<{
        name_el: string;
        name_en: string;
      }>
    | null;
};

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const result = schema.safeParse(json);
  const fallbackIdentifier = result.success ? `reschedule:${result.data.token}` : "booking:reschedule";
  const rateLimit = await checkRateLimit({
    route: "booking:reschedule",
    identifier: getRequestIdentifier(request, fallbackIdentifier),
    limit: 10,
    windowSeconds: 60 * 10,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many reschedule attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  if (!result.success) {
    return NextResponse.json({ error: "Invalid reschedule details." }, { status: 400 });
  }

  const { token, locale, startAt } = result.data;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id,appointment_type_id,patient_name,patient_email,patient_phone,patient_note,start_at,end_at,reschedule_token_expires_at,status,google_event_id,appointment_types(name_el,name_en)",
    )
    .eq("reschedule_token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  const appointment = data as unknown as AppointmentRow;

  if (new Date(appointment.reschedule_token_expires_at) <= new Date()) {
    return NextResponse.json(
      { error: "This reschedule link has expired." },
      { status: 410 },
    );
  }

  if (
    appointment.status !== "confirmed" ||
    !appointment.appointment_type_id ||
    new Date(appointment.start_at) <= new Date()
  ) {
    return NextResponse.json(
      { error: "This appointment can no longer be rescheduled online." },
      { status: 409 },
    );
  }

  const days = await getAvailabilityForAppointmentType(appointment.appointment_type_id, {
    excludeAppointmentId: appointment.id,
  });
  const selectedSlot = days.flatMap((day) => day.slots).find((slot) => slot.startAt === startAt);

  if (!selectedSlot) {
    return NextResponse.json(
      { error: "This appointment time is no longer available." },
      { status: 409 },
    );
  }

  const previousStartAt = appointment.start_at;
  const previousEndAt = appointment.end_at;
  const hasOverlap = await hasConfirmedAppointmentOverlap({
    startAt: selectedSlot.startAt,
    endAt: selectedSlot.endAt,
    excludeAppointmentId: appointment.id,
  });

  if (hasOverlap) {
    return NextResponse.json(
      { error: "This appointment time is no longer available." },
      { status: 409 },
    );
  }

  const { data: updatedAppointment, error: updateError } = await supabase
    .from("appointments")
    .update({
      start_at: selectedSlot.startAt,
      end_at: selectedSlot.endAt,
      reschedule_token_expires_at: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    })
    .eq("id", appointment.id)
    .select("id,start_at,end_at")
    .single();

  if (updateError) {
    if (updateError.code === "23P01") {
      return NextResponse.json(
        { error: "This appointment time is no longer available." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Could not reschedule appointment." }, { status: 500 });
  }

  await supabase.from("analytics_events").insert({
    event_type: "booking_rescheduled",
    metadata: {
      appointment_id: appointment.id,
      appointment_type_id: appointment.appointment_type_id,
      previous_start_at: previousStartAt,
      previous_end_at: previousEndAt,
      new_start_at: updatedAppointment.start_at,
      new_end_at: updatedAppointment.end_at,
      rescheduled_by: "patient",
    },
  });

  const [doctorProfileResult, notificationSettingsResult] = await Promise.all([
    supabase
      .from("doctor_profile")
      .select("clinic_name,email")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("notification_settings")
      .select("patient_reschedule_email_enabled,doctor_reschedule_email_enabled")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
  ]);

  const appointmentType = Array.isArray(appointment.appointment_types)
    ? appointment.appointment_types[0]
    : appointment.appointment_types;
  const appointmentTypeName =
    locale === "el"
      ? appointmentType?.name_el ?? "Άλλη θεραπεία"
      : appointmentType?.name_en ?? "Other";
  const clinicName = doctorProfileResult.data?.clinic_name ?? "Dental Clinic";
  const doctorEmail = doctorProfileResult.data?.email;

  await updateCalendarEvent({
    eventId: appointment.google_event_id,
    appointmentId: appointment.id,
    appointmentTypeName,
    patientName: appointment.patient_name,
    patientEmail: appointment.patient_email,
    patientPhone: appointment.patient_phone,
    patientNote: appointment.patient_note,
    startAt: updatedAppointment.start_at,
    endAt: updatedAppointment.end_at,
  }).catch(() => null);

  if (doctorEmail) {
    const emailInput = {
      locale,
      clinicName,
      doctorEmail,
      appointmentTypeName,
      patientName: appointment.patient_name,
      patientEmail: appointment.patient_email,
      patientPhone: appointment.patient_phone,
      patientNote: appointment.patient_note,
      startAt: updatedAppointment.start_at,
      endAt: updatedAppointment.end_at,
      previousStartAt,
      previousEndAt,
    };

    const notifications = notificationSettingsResult.data;
    const emailTasks = [];

    if (notifications?.patient_reschedule_email_enabled ?? true) {
      emailTasks.push(sendPatientRescheduleConfirmation(emailInput));
    }

    if (notifications?.doctor_reschedule_email_enabled ?? true) {
      emailTasks.push(sendDoctorRescheduleNotification(emailInput));
    }

    await Promise.allSettled(emailTasks);
  }

  return NextResponse.json({
    appointment: {
      id: updatedAppointment.id,
      startAt: updatedAppointment.start_at,
      endAt: updatedAppointment.end_at,
    },
  });
}
