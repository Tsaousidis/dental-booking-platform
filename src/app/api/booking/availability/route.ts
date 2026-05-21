import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

const availabilitySearchParamsSchema = z.object({
  appointmentTypeId: z.string().uuid(),
});

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit({
    route: "booking:availability",
    identifier: getRequestIdentifier(request),
    limit: 120,
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

  const url = new URL(request.url);
  const result = availabilitySearchParamsSchema.safeParse({
    appointmentTypeId: url.searchParams.get("appointmentTypeId"),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid appointment type." },
      { status: 400 },
    );
  }

  const days = await getAvailabilityForAppointmentType(result.data.appointmentTypeId);

  return NextResponse.json(
    { days },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
