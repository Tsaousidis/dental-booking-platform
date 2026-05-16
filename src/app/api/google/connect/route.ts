import { NextResponse } from "next/server";

import {
  createGoogleOAuthClient,
  getGoogleCalendarScopes,
  hasGoogleCalendarEnv,
} from "@/lib/google-calendar/client";

export async function GET() {
  if (!hasGoogleCalendarEnv()) {
    return NextResponse.redirect(
      new URL(
        "/admin/settings?google=missing-env",
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      ),
    );
  }

  const auth = createGoogleOAuthClient();
  const url = auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: getGoogleCalendarScopes(),
  });

  return NextResponse.redirect(url);
}
