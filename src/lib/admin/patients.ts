import "server-only";

import { revalidatePath } from "next/cache";

import { normalizeGreekPhone } from "@/lib/phone";

import { writeAdminAuditLog } from "./audit-log";
import { createAuthorizedAdminClient, createAuthorizedAdminContext } from "./auth";

export type AdminPatientAppointment = {
  id: string;
  patient_note: string | null;
  start_at: string;
  end_at: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  appointment_types: {
    name_el: string;
    name_en: string;
  } | null;
};

export type AdminPatient = {
  id: string;
  display_name: string;
  email: string | null;
  phone: string;
  normalized_phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  appointments: AdminPatientAppointment[];
};

type RawAdminPatient = Omit<AdminPatient, "appointments"> & {
  appointments?: AdminPatientAppointment[];
};

type RawPatientAppointment = Omit<AdminPatientAppointment, "appointment_types"> & {
  patient_id: string | null;
  appointment_types:
    | AdminPatientAppointment["appointment_types"]
    | NonNullable<AdminPatientAppointment["appointment_types"]>[];
};

export async function getAdminPatients() {
  const supabase = await createAuthorizedAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id,display_name,email,phone,normalized_phone,notes,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const patients = (data ?? []) as unknown as RawAdminPatient[];
  const patientIds = patients.map((patient) => patient.id);

  if (patientIds.length === 0) {
    return [];
  }

  const appointmentsResult = await supabase
    .from("appointments")
    .select("id,patient_id,patient_note,start_at,end_at,status,appointment_types(name_el,name_en)")
    .in("patient_id", patientIds);

  const appointmentsByPatientId = new Map<string, AdminPatientAppointment[]>();

  if (!appointmentsResult.error) {
    ((appointmentsResult.data ?? []) as unknown as RawPatientAppointment[]).forEach((appointment) => {
      if (!appointment.patient_id) {
        return;
      }

      const patientAppointments = appointmentsByPatientId.get(appointment.patient_id) ?? [];
      patientAppointments.push({
        ...appointment,
        appointment_types: Array.isArray(appointment.appointment_types)
          ? appointment.appointment_types[0] ?? null
          : appointment.appointment_types,
      });
      appointmentsByPatientId.set(appointment.patient_id, patientAppointments);
    });
  }

  return patients.map((patient) => ({
    ...patient,
    appointments: (appointmentsByPatientId.get(patient.id) ?? []).sort(
      (first, second) =>
        new Date(second.start_at).getTime() - new Date(first.start_at).getTime(),
    ),
  }));
}

export async function updatePatientNotes(formData: FormData) {
  "use server";

  const patientId = String(formData.get("patient_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!patientId) {
    throw new Error("Λείπει ο ασθενής.");
  }

  const { supabase, user } = await createAuthorizedAdminContext();
  const { data: currentPatient } = await supabase
    .from("patients")
    .select("notes")
    .eq("id", patientId)
    .maybeSingle();

  const { error } = await supabase
    .from("patients")
    .update({ notes: notes || null })
    .eq("id", patientId);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminAuditLog({
    adminEmail: user.email,
    action: "patient_notes_updated",
    entityType: "patient",
    entityId: patientId,
    metadata: {
      previous_has_notes: Boolean(currentPatient?.notes),
      new_has_notes: Boolean(notes),
    },
  });

  revalidatePath("/admin/patients");
  revalidatePath("/admin/appointments");
}

export function buildPatientSearchText(patient: AdminPatient) {
  return [
    patient.display_name,
    patient.email ?? "",
    patient.phone,
    patient.normalized_phone,
    normalizeGreekPhone(patient.phone),
  ]
    .join(" ")
    .toLowerCase();
}
