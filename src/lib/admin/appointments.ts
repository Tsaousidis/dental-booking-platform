import "server-only";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AppointmentStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export type AdminAppointment = {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_note: string | null;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  google_event_id: string | null;
  appointment_types: {
    name_el: string;
    name_en: string;
    duration_minutes: number;
  } | null;
};

export async function getAdminAppointments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id,patient_name,patient_email,patient_phone,patient_note,start_at,end_at,status,google_event_id,appointment_types(name_el,name_en,duration_minutes)",
    )
    .order("start_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as RawAdminAppointment[]).map((appointment) => ({
    ...appointment,
    appointment_types: Array.isArray(appointment.appointment_types)
      ? appointment.appointment_types[0] ?? null
      : appointment.appointment_types,
  }));
}

export async function updateAppointmentStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("appointment_id") ?? "");
  const status = String(formData.get("status") ?? "") as AppointmentStatus;

  if (!id || !["confirmed", "completed", "cancelled", "no_show"].includes(status)) {
    throw new Error("Μη έγκυρη αλλαγή status.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/appointments");
}

type RawAdminAppointment = Omit<AdminAppointment, "appointment_types"> & {
  appointment_types:
    | AdminAppointment["appointment_types"]
    | NonNullable<AdminAppointment["appointment_types"]>[];
};
