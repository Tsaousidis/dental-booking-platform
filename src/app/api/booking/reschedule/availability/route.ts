import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().trim().min(32),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = schema.safeParse({
    token: url.searchParams.get("token"),
  });

  if (!result.success) {
    return NextResponse.json({ error: "Invalid reschedule link." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id,appointment_type_id,status")
    .eq("reschedule_token", result.data.token)
    .maybeSingle();

  if (error || !data || !data.appointment_type_id) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  if (data.status !== "confirmed") {
    return NextResponse.json(
      { error: "This appointment can no longer be rescheduled online." },
      { status: 409 },
    );
  }

  const days = await getAvailabilityForAppointmentType(data.appointment_type_id, {
    excludeAppointmentId: data.id,
  });

  return NextResponse.json({ days });
}
