import { NextResponse } from "next/server";
import { z } from "zod";

const COOKIE_NAME = "dental_cookie_consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const cookieConsentSchema = z.object({
  value: z.enum(["accepted", "rejected"]),
});

export async function POST(request: Request) {
  const parsed = cookieConsentSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cookie consent." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(
    COOKIE_NAME,
    JSON.stringify({
      value: parsed.data.value,
      savedAt: new Date().toISOString(),
      version: 1,
    }),
    {
      httpOnly: true,
      maxAge: CONSENT_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}
