import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import {
  sendDoctorNewBookingNotification,
  sendPatientBookingConfirmation,
} from "@/lib/emails/booking-emails";
import { createAdminClient } from "@/lib/supabase/admin";

const createBookingSchema = z.object({
  locale: z.enum(["el", "en"]).default("el"),
  appointmentTypeId: z.string().uuid(),
  startAt: z.string().datetime(),
  patientName: z.string().trim().min(2).max(120),
  patientEmail: z.string().trim().email().max(180),
  patientPhone: z.string().trim().min(6).max(40),
  patientNote: z.string().trim().max(1000).optional().default(""),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const result = createBookingSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid booking details." },
      { status: 400 },
    );
  }

  const input = result.data;
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
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      appointment_type_id: input.appointmentTypeId,
      patient_name: input.patientName,
      patient_email: input.patientEmail,
      patient_phone: input.patientPhone,
      patient_note: input.patientNote || null,
      start_at: selectedSlot.startAt,
      end_at: selectedSlot.endAt,
      status: "confirmed",
    })
    .select("id,start_at,end_at")
    .single();

  if (appointmentError) {
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

  const [appointmentTypeResult, doctorProfileResult] = await Promise.all([
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
  ]);

  const appointmentTypeName =
    input.locale === "el"
      ? appointmentTypeResult.data?.name_el
      : appointmentTypeResult.data?.name_en;
  const clinicName = doctorProfileResult.data?.clinic_name ?? "Dental Clinic";
  const doctorEmail = doctorProfileResult.data?.email;

  if (appointmentTypeName && doctorEmail) {
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
    };

    await Promise.allSettled([
      sendPatientBookingConfirmation(emailInput),
      sendDoctorNewBookingNotification(emailInput),
    ]);
  }

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
    },
  });
}
