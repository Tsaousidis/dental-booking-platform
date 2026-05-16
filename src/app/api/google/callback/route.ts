import { google } from "googleapis";
import { NextResponse } from "next/server";

import { createGoogleOAuthClient } from "@/lib/google-calendar/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/settings?google=missing-code", url.origin));
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
    access_token: tokens.access_token ?? null,
    refresh_token: tokens.refresh_token ?? null,
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    calendar_id: "primary",
    is_connected: true,
  });

  return NextResponse.redirect(new URL("/admin/settings?google=connected", url.origin));
}
