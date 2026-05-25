import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { type Locale } from "@/config/locales";
import { site } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/admin";

export type ConfirmedAppointmentDetails = {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentTypeName: string;
  appointmentTime: string;
  clinicName: string;
  clinicEmail: string | null;
  clinicPhone: string | null;
  clinicAddress: string | null;
  status: string;
  cancelUrl: string;
  rescheduleUrl: string;
};

type AppointmentRow = {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  start_at: string;
  end_at: string;
  cancel_token: string;
  reschedule_token: string;
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

type DoctorProfileRow = {
  clinic_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export async function getConfirmedAppointmentDetails({
  token,
  locale,
}: {
  token: string;
  locale: Locale;
}): Promise<ConfirmedAppointmentDetails | null> {
  const supabase = createAdminClient();
  const [appointmentResult, doctorProfileResult] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "patient_name,patient_email,patient_phone,start_at,end_at,cancel_token,reschedule_token,cancel_token_expires_at,status,appointment_types(name_el,name_en)",
      )
      .eq("cancel_token", token)
      .maybeSingle(),
    supabase
      .from("doctor_profile")
      .select("clinic_name,email,phone,address")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
  ]);

  if (appointmentResult.error || !appointmentResult.data) {
    return null;
  }

  const appointment = appointmentResult.data as unknown as AppointmentRow;

  if (new Date(appointment.cancel_token_expires_at) <= new Date()) {
    return null;
  }

  const appointmentType = Array.isArray(appointment.appointment_types)
    ? appointment.appointment_types[0]
    : appointment.appointment_types;
  const doctorProfile = doctorProfileResult.data as DoctorProfileRow | null;

  return {
    patientName: appointment.patient_name,
    patientEmail: appointment.patient_email,
    patientPhone: appointment.patient_phone,
    appointmentTypeName:
      locale === "el"
        ? appointmentType?.name_el ?? "Άλλη θεραπεία"
        : appointmentType?.name_en ?? "Other",
    appointmentTime: formatAppointmentRange(appointment.start_at, appointment.end_at),
    clinicName: doctorProfile?.clinic_name ?? site.name,
    clinicEmail: doctorProfile?.email ?? null,
    clinicPhone: doctorProfile?.phone ?? null,
    clinicAddress: doctorProfile?.address ?? null,
    status: appointment.status,
    cancelUrl: `/${locale}/booking/cancel?token=${appointment.cancel_token}`,
    rescheduleUrl: `/${locale}/booking/reschedule?token=${appointment.reschedule_token}`,
  };
}

function formatAppointmentRange(startAt: string, endAt: string) {
  const date = formatInTimeZone(startAt, "Europe/Athens", "dd/MM/yyyy");
  const start = formatInTimeZone(startAt, "Europe/Athens", "HH:mm");
  const end = formatInTimeZone(endAt, "Europe/Athens", "HH:mm");

  return `${date}, ${start}-${end}`;
}

