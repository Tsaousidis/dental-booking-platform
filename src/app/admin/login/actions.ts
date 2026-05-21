"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { requireAdminUser } from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
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

  const rateLimit = await checkRateLimit({
    route: "admin:login",
    identifier: `${getLoginIdentifier(await headers())}:${email.toLowerCase()}`,
    limit: 5,
    windowSeconds: 60 * 10,
  });

  if (!rateLimit.allowed) {
    return {
      message: "Πολλές προσπάθειες σύνδεσης. Δοκιμάστε ξανά σε λίγα λεπτά.",
    };
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

function getLoginIdentifier(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();

  return (
    headersList.get("cf-connecting-ip") ??
    forwardedFor ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}
