import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createGoogleOAuthClient,
  getGoogleCalendarScopes,
  hasGoogleCalendarEnv,
} from "@/lib/google-calendar/client";
import { requireAdminUser } from "@/lib/admin/auth";

const googleSettingsUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET() {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", googleSettingsUrl));
  }

  if (!hasGoogleCalendarEnv()) {
    return NextResponse.redirect(
      new URL(
        "/admin/settings?google=missing-env",
        googleSettingsUrl,
      ),
    );
  }

  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/api/google",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const auth = createGoogleOAuthClient();
  const url = auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: getGoogleCalendarScopes(),
    state,
  });

  return NextResponse.redirect(url);
}
