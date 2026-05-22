import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type OverlapCheckOptions = {
  startAt: string;
  endAt: string;
  excludeAppointmentId?: string;
};

export async function hasConfirmedAppointmentOverlap({
  startAt,
  endAt,
  excludeAppointmentId,
}: OverlapCheckOptions) {
  const supabase = createAdminClient();
  let query = supabase
    .from("appointments")
    .select("id")
    .eq("status", "confirmed")
    .lt("start_at", endAt)
    .gt("end_at", startAt)
    .limit(1);

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}
