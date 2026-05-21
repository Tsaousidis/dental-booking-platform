import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { type Locale } from "@/config/locales";
import { createAdminClient } from "@/lib/supabase/admin";

export type CancelAppointmentDetails = {
  patientName: string;
  patientEmail: string;
  appointmentTypeName: string;
  appointmentTime: string;
  status: string;
};

type AppointmentRow = {
  patient_name: string;
  patient_email: string;
  start_at: string;
  end_at: string;
  cancel_token_expires_at: string;
  status: string;
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

export async function getCancelAppointmentDetails({
  token,
  locale,
}: {
  token: string;
  locale: Locale;
}): Promise<CancelAppointmentDetails | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("patient_name,patient_email,start_at,end_at,cancel_token_expires_at,status,appointment_types(name_el,name_en)")
    .eq("cancel_token", token)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const appointment = data as unknown as AppointmentRow;

  if (new Date(appointment.cancel_token_expires_at) <= new Date()) {
    return null;
  }

  const appointmentType = Array.isArray(appointment.appointment_types)
    ? appointment.appointment_types[0]
    : appointment.appointment_types;

  return {
    patientName: appointment.patient_name,
    patientEmail: appointment.patient_email,
    appointmentTypeName:
      locale === "el"
        ? appointmentType?.name_el ?? "Άλλη θεραπεία"
        : appointmentType?.name_en ?? "Other",
    appointmentTime: formatAppointmentRange(appointment.start_at, appointment.end_at),
    status: appointment.status,
  };
}

function formatAppointmentRange(startAt: string, endAt: string) {
  const date = formatInTimeZone(startAt, "Europe/Athens", "dd/MM/yyyy");
  const start = formatInTimeZone(startAt, "Europe/Athens", "HH:mm");
  const end = formatInTimeZone(endAt, "Europe/Athens", "HH:mm");

  return `${date}, ${start}-${end}`;
}
