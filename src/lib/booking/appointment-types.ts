import "server-only";

import { type Locale } from "@/config/locales";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicAppointmentType = {
  id: string;
  name: string;
  durationMinutes: number;
};

type AppointmentTypeRow = {
  id: string;
  name_el: string;
  name_en: string;
  duration_minutes: number;
};

export async function getPublicAppointmentTypes(
  locale: Locale,
): Promise<PublicAppointmentType[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointment_types")
    .select("id,name_el,name_en,duration_minutes")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as AppointmentTypeRow[]).map((type) => ({
    id: type.id,
    name: locale === "el" ? type.name_el : type.name_en,
    durationMinutes: type.duration_minutes,
  }));
}
