import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";

const availabilitySearchParamsSchema = z.object({
  appointmentTypeId: z.string().uuid(),
});

export async function GET(request: Request) {
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

  return NextResponse.json({ days });
}
