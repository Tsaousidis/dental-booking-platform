"use server";

import { redirect } from "next/navigation";

import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  message?: string;
};

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseBrowserEnv()) {
    return {
      message: "Supabase environment variables are missing. Add them to .env.local first.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message };
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
