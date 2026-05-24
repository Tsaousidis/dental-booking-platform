import "server-only";

import { normalizeGreekPhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";

type EnsurePatientInput = {
  name: string;
  email: string;
  phone: string;
};

export async function ensurePatientProfile({ name, email, phone }: EnsurePatientInput) {
  const normalizedPhone = normalizeGreekPhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: existingPatient, error: existingPatientError } = await supabase
    .from("patients")
    .select("id")
    .eq("normalized_phone", normalizedPhone)
    .maybeSingle();

  if (existingPatientError) {
    throw new Error(existingPatientError.message);
  }

  if (existingPatient?.id) {
    const { error } = await supabase
      .from("patients")
      .update({
        display_name: name,
        email: email.toLowerCase(),
        phone,
      })
      .eq("id", existingPatient.id);

    if (error) {
      throw new Error(error.message);
    }

    return existingPatient.id as string;
  }

  const { data: newPatient, error: newPatientError } = await supabase
    .from("patients")
    .insert({
      display_name: name,
      email: email.toLowerCase(),
      phone,
      normalized_phone: normalizedPhone,
    })
    .select("id")
    .single();

  if (newPatientError) {
    if (newPatientError.code === "23505") {
      const { data: racedPatient, error: racedPatientError } = await supabase
        .from("patients")
        .select("id")
        .eq("normalized_phone", normalizedPhone)
        .maybeSingle();

      if (racedPatientError) {
        throw new Error(racedPatientError.message);
      }

      return (racedPatient?.id as string | undefined) ?? null;
    }

    throw new Error(newPatientError.message);
  }

  return newPatient.id as string;
}
