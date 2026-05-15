import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceEnv } from "./env";

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
