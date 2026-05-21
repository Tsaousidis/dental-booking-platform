"use server";

import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/auth";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  message?: string;
};

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseBrowserEnv()) {
    return {
      message:
        "Λείπουν οι μεταβλητές περιβάλλοντος του Supabase. Προσθέστε τις στο .env.local πρώτα.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Το email και ο κωδικός είναι υποχρεωτικά." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: "Η σύνδεση απέτυχε. Ελέγξτε τα στοιχεία σας." };
  }

  try {
    await requireAdminUser();
  } catch {
    await supabase.auth.signOut();
    return { message: "Ο χρήστης δεν έχει πρόσβαση στο admin." };
  }

  redirect("/admin/appointments");
}

export async function logout() {
  if (hasSupabaseBrowserEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}
