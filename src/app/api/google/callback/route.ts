import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createGoogleOAuthClient } from "@/lib/google-calendar/client";
import { requireAdminUser } from "@/lib/admin/auth";
import { encryptSecret } from "@/lib/security/encryption";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;

  cookieStore.delete("google_oauth_state");

  try {
    await requireAdminUser();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", url.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/settings?google=missing-code", url.origin));
  }

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/admin/settings?google=invalid-state", url.origin));
  }

  const auth = createGoogleOAuthClient();
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth });
  const userInfo = await oauth2.userinfo.get();
  const supabase = createAdminClient();

  await supabase
    .from("google_calendar_connections")
    .update({ is_connected: false })
    .eq("is_connected", true);
  await supabase.from("google_calendar_connections").insert({
    google_account_email: userInfo.data.email ?? null,
    access_token: encryptSecret(tokens.access_token),
    refresh_token: encryptSecret(tokens.refresh_token),
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    calendar_id: "primary",
    is_connected: true,
  });

  return NextResponse.redirect(new URL("/admin/settings?google=connected", url.origin));
}
