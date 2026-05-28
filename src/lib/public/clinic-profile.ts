import "server-only";

import { brand } from "@/config/brand";
import { type Locale } from "@/config/locales";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicClinicProfile = {
  clinicName: string;
  doctorName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  timezone: string;
};

type DoctorProfileRow = {
  doctor_name: string | null;
  clinic_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  timezone: string | null;
};

export async function getPublicClinicProfile(): Promise<PublicClinicProfile> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("doctor_profile")
      .select("doctor_name,clinic_name,email,phone,address,city,timezone")
      .order("created_at")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return getFallbackProfile("el");
    }

    const profile = data as DoctorProfileRow;

    return {
      clinicName: profile.clinic_name || brand.clinicName,
      doctorName: profile.doctor_name || brand.doctorName,
      email: profile.email || brand.email,
      phone: profile.phone || brand.phone,
      address: profile.address || brand.localizedAddress.el.fullAddress,
      city: profile.city || brand.localizedAddress.el.city,
      timezone: profile.timezone || brand.timezone,
    };
  } catch {
    return getFallbackProfile("el");
  }
}

export function getFallbackProfile(locale: Locale): PublicClinicProfile {
  const address = brand.localizedAddress[locale];

  return {
    clinicName: brand.clinicName,
    doctorName: brand.doctorName,
    email: brand.email,
    phone: brand.phone,
    address: address.fullAddress,
    city: address.city,
    timezone: brand.timezone,
  };
}
