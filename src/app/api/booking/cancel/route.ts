import { NextResponse } from "next/server";
import { z } from "zod";

import {
  sendDoctorCancellationNotification,
  sendPatientCancellationConfirmation,
} from "@/lib/emails/booking-emails";
import { deleteCalendarEvent } from "@/lib/google-calendar/events";
import { createAdminClient } from "@/lib/supabase/admin";

const cancelBookingSchema = z.object({
  token: z.string().trim().min(32),
  locale: z.enum(["el", "en"]).default("el"),
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
  const result = cancelBookingSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid cancellation link." },
      { status: 400 },
    );
  }

  const { token, locale } = result.data;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id,appointment_type_id,patient_name,patient_email,patient_phone,patient_note,start_at,end_at,status,google_event_id,appointment_types(name_el,name_en)",
    )
    .eq("cancel_token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Appointment not found." },
      { status: 404 },
    );
  }

  const appointment = data as unknown as AppointmentRow;

  if (appointment.status === "cancelled") {
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (appointment.status !== "confirmed") {
    return NextResponse.json(
      { error: "This appointment can no longer be cancelled online." },
      { status: 409 },
    );
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointment.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Could not cancel appointment." },
      { status: 500 },
    );
  }

  await supabase.from("analytics_events").insert({
    event_type: "booking_cancelled",
    metadata: {
      appointment_id: appointment.id,
      appointment_type_id: appointment.appointment_type_id,
      start_at: appointment.start_at,
      cancelled_by: "patient",
    },
  });

  await deleteCalendarEvent(appointment.google_event_id).catch(() => null);

  const [doctorProfileResult] = await Promise.all([
    supabase
      .from("doctor_profile")
      .select("clinic_name,email")
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
      startAt: appointment.start_at,
      endAt: appointment.end_at,
    };

    await Promise.allSettled([
      sendPatientCancellationConfirmation(emailInput),
      sendDoctorCancellationNotification(emailInput),
    ]);
  }

  return NextResponse.json({ ok: true, status: "cancelled" });
}
