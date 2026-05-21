import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthorizedAdminUser = {
  id: string;
  email: string;
};

export async function requireAdminUser(): Promise<AuthorizedAdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    throw new Error("Unauthorized admin request.");
  }

  const allowedEmails = getAllowedAdminEmails();

  if (allowedEmails.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_EMAILS is required in production.");
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  if (!allowedEmails.includes(user.email.toLowerCase())) {
    throw new Error("This user is not allowed to access the admin area.");
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function createAuthorizedAdminClient() {
  await requireAdminUser();

  return createAdminClient();
}

export async function createAuthorizedAdminContext() {
  const user = await requireAdminUser();
  const supabase = createAdminClient();

  return { supabase, user };
}

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
