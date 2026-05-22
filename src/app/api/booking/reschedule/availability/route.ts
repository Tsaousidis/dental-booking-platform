import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().trim().min(32).max(128),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = schema.safeParse({
    token: url.searchParams.get("token"),
  });
  const fallbackIdentifier = result.success
    ? `reschedule-availability:${result.data.token}`
    : "booking:reschedule-availability";
  const rateLimit = await checkRateLimit({
    route: "booking:reschedule-availability",
    identifier: getRequestIdentifier(request, fallbackIdentifier),
    limit: 30,
    windowSeconds: 60 * 10,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many availability requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  if (!result.success) {
    return NextResponse.json({ error: "Invalid reschedule link." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id,appointment_type_id,status,start_at,reschedule_token_expires_at")
    .eq("reschedule_token", result.data.token)
    .maybeSingle();

  if (error || !data || !data.appointment_type_id) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  if (new Date(data.reschedule_token_expires_at) <= new Date()) {
    return NextResponse.json(
      { error: "This reschedule link has expired." },
      { status: 410 },
    );
  }

  if (data.status !== "confirmed" || new Date(data.start_at) <= new Date()) {
    return NextResponse.json(
      { error: "This appointment can no longer be rescheduled online." },
      { status: 409 },
    );
  }

  const days = await getAvailabilityForAppointmentType(data.appointment_type_id, {
    excludeAppointmentId: data.id,
  });

  return NextResponse.json(
    { days },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
