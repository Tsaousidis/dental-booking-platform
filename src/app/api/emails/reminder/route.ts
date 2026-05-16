import { NextResponse } from "next/server";

import {
  sendDoctorReminderEmail,
  sendPatientReminderEmail,
} from "@/lib/emails/booking-emails";
import { createAdminClient } from "@/lib/supabase/admin";

type ReminderAppointment = {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_note: string | null;
  start_at: string;
  end_at: string;
  patient_reminder_sent_at: string | null;
  doctor_reminder_sent_at: string | null;
  appointment_types:
    | {
        name_el: string;
      }
    | {
        name_el: string;
      }[]
    | null;
};

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const [settingsResult, profileResult] = await Promise.all([
    supabase
      .from("notification_settings")
      .select(
        "patient_reminder_email_enabled,doctor_reminder_email_enabled,reminder_hours_before",
      )
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("doctor_profile")
      .select("clinic_name,email")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (settingsResult.error) {
    return NextResponse.json({ error: settingsResult.error.message }, { status: 500 });
  }

  if (profileResult.error) {
    return NextResponse.json({ error: profileResult.error.message }, { status: 500 });
  }

  const settings = settingsResult.data;
  const profile = profileResult.data;

  if (!settings || !profile?.email) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      patientRemindersSent: 0,
      doctorRemindersSent: 0,
    });
  }

  const now = new Date();
  const reminderWindowEnd = new Date(
    now.getTime() + settings.reminder_hours_before * 60 * 60 * 1000,
  );

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id,patient_name,patient_email,patient_phone,patient_note,start_at,end_at,patient_reminder_sent_at,doctor_reminder_sent_at,appointment_types(name_el)",
    )
    .eq("status", "confirmed")
    .gt("start_at", now.toISOString())
    .lte("start_at", reminderWindowEnd.toISOString())
    .or("patient_reminder_sent_at.is.null,doctor_reminder_sent_at.is.null")
    .order("start_at", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appointments = ((data ?? []) as unknown as ReminderAppointment[]).map(
    (appointment) => ({
      ...appointment,
      appointment_types: Array.isArray(appointment.appointment_types)
        ? appointment.appointment_types[0] ?? null
        : appointment.appointment_types,
    }),
  );

  let patientRemindersSent = 0;
  let doctorRemindersSent = 0;

  for (const appointment of appointments) {
    const emailInput = {
      locale: "el" as const,
      clinicName: profile.clinic_name ?? "Dental Clinic",
      doctorEmail: profile.email,
      appointmentTypeName: appointment.appointment_types?.name_el ?? "Άλλη θεραπεία",
      patientName: appointment.patient_name,
      patientEmail: appointment.patient_email,
      patientPhone: appointment.patient_phone,
      patientNote: appointment.patient_note,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
    };

    const updates: {
      patient_reminder_sent_at?: string;
      doctor_reminder_sent_at?: string;
    } = {};

    if (
      settings.patient_reminder_email_enabled &&
      !appointment.patient_reminder_sent_at
    ) {
      const result = await sendPatientReminderEmail(emailInput);

      if (wasEmailAccepted(result)) {
        updates.patient_reminder_sent_at = new Date().toISOString();
        patientRemindersSent += 1;
      }
    }

    if (
      settings.doctor_reminder_email_enabled &&
      !appointment.doctor_reminder_sent_at
    ) {
      const result = await sendDoctorReminderEmail(emailInput);

      if (wasEmailAccepted(result)) {
        updates.doctor_reminder_sent_at = new Date().toISOString();
        doctorRemindersSent += 1;
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("appointments").update(updates).eq("id", appointment.id);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: appointments.length,
    patientRemindersSent,
    doctorRemindersSent,
  });
}

function wasEmailAccepted(result: unknown) {
  if (!result || typeof result !== "object") {
    return false;
  }

  if ("skipped" in result) {
    return false;
  }

  if ("error" in result && result.error) {
    return false;
  }

  return true;
}
