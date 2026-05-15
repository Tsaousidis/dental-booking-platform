export function hasSupabaseBrowserEnv() {
  return Boolean(
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseBrowserEnv(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isValidHttpUrl(supabaseUrl) || !supabaseAnonKey) {
    throw new Error(
      "Missing or invalid Supabase public environment variables.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabaseServiceEnv(): {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isValidHttpUrl(supabaseUrl) || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing or invalid Supabase service environment variables.",
    );
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
