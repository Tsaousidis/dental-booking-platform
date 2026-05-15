import "server-only";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DoctorProfile = {
  id: string;
  doctor_name: string;
  clinic_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  timezone: string;
};

export type BookingSettings = {
  id: string;
  booking_horizon_days: number;
  buffer_minutes: number;
  min_notice_hours: number;
  timezone: string;
};

export type AppointmentType = {
  id: string;
  name_el: string;
  name_en: string;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
};

export type AdminSettingsData = {
  doctorProfile: DoctorProfile | null;
  bookingSettings: BookingSettings | null;
  appointmentTypes: AppointmentType[];
};

export async function getAdminSettings(): Promise<AdminSettingsData> {
  const supabase = await createClient();

  const [doctorProfileResult, bookingSettingsResult, appointmentTypesResult] =
    await Promise.all([
      supabase.from("doctor_profile").select("*").order("created_at").limit(1).maybeSingle(),
      supabase.from("booking_settings").select("*").order("created_at").limit(1).maybeSingle(),
      supabase
        .from("appointment_types")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

  if (doctorProfileResult.error) {
    throw new Error(doctorProfileResult.error.message);
  }

  if (bookingSettingsResult.error) {
    throw new Error(bookingSettingsResult.error.message);
  }

  if (appointmentTypesResult.error) {
    throw new Error(appointmentTypesResult.error.message);
  }

  return {
    doctorProfile: doctorProfileResult.data,
    bookingSettings: bookingSettingsResult.data,
    appointmentTypes: appointmentTypesResult.data ?? [],
  };
}

export async function saveAdminSettings(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const doctorProfileId = getRequiredValue(formData, "doctor_profile_id");
  const bookingSettingsId = getRequiredValue(formData, "booking_settings_id");
  const appointmentTypeIds = getRequiredValue(formData, "appointment_type_ids")
    .split(",")
    .filter(Boolean);

  const doctorProfile = {
    doctor_name: getRequiredValue(formData, "doctor_name"),
    clinic_name: getRequiredValue(formData, "clinic_name"),
    email: getRequiredValue(formData, "email"),
    phone: getRequiredValue(formData, "phone"),
    address: getRequiredValue(formData, "address"),
    city: getRequiredValue(formData, "city"),
    timezone: getRequiredValue(formData, "profile_timezone"),
  };

  const bookingSettings = {
    booking_horizon_days: getPositiveInteger(formData, "booking_horizon_days"),
    buffer_minutes: getNonNegativeInteger(formData, "buffer_minutes"),
    min_notice_hours: getNonNegativeInteger(formData, "min_notice_hours"),
    timezone: getRequiredValue(formData, "booking_timezone"),
  };

  const { error: doctorProfileError } = await supabase
    .from("doctor_profile")
    .update(doctorProfile)
    .eq("id", doctorProfileId);

  if (doctorProfileError) {
    throw new Error(doctorProfileError.message);
  }

  const { error: bookingSettingsError } = await supabase
    .from("booking_settings")
    .update(bookingSettings)
    .eq("id", bookingSettingsId);

  if (bookingSettingsError) {
    throw new Error(bookingSettingsError.message);
  }

  await Promise.all(
    appointmentTypeIds.map(async (id) => {
      const { error } = await supabase
        .from("appointment_types")
        .update({
          name_el: getRequiredValue(formData, `appointment_type_${id}_name_el`),
          name_en: getRequiredValue(formData, `appointment_type_${id}_name_en`),
          duration_minutes: getPositiveInteger(
            formData,
            `appointment_type_${id}_duration_minutes`,
          ),
          sort_order: getNonNegativeInteger(formData, `appointment_type_${id}_sort_order`),
          is_active: formData.get(`appointment_type_${id}_is_active`) === "on",
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    }),
  );

  revalidatePath("/admin/settings");
}

function getRequiredValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function getPositiveInteger(formData: FormData, key: string) {
  const value = Number(getRequiredValue(formData, key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer.`);
  }

  return value;
}

function getNonNegativeInteger(formData: FormData, key: string) {
  const value = Number(getRequiredValue(formData, key));

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${key} must be zero or greater.`);
  }

  return value;
}
