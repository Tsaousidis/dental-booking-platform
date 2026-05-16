import "server-only";

import { addDays } from "date-fns";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  type AvailabilityAppointment,
  type AvailabilityAppointmentType,
  type AvailabilityBlockedSlot,
  type AvailabilityBookingSettings,
  type AvailabilityDoctorSchedule,
  type AvailabilityScheduleBreak,
  getAvailableDays,
} from "./availability";

export async function getAvailabilityForAppointmentType(
  appointmentTypeId: string,
  options: { excludeAppointmentId?: string } = {},
) {
  const supabase = createAdminClient();

  const [
    appointmentTypeResult,
    scheduleResult,
    breaksResult,
    bookingSettingsResult,
  ] = await Promise.all([
    supabase
      .from("appointment_types")
      .select("id,duration_minutes,is_active")
      .eq("id", appointmentTypeId)
      .maybeSingle(),
    supabase
      .from("doctor_schedule")
      .select("day_of_week,is_working,start_time,end_time")
      .order("day_of_week", { ascending: true }),
    supabase
      .from("schedule_breaks")
      .select("day_of_week,start_time,end_time")
      .order("day_of_week", { ascending: true }),
    supabase
      .from("booking_settings")
      .select("booking_horizon_days,buffer_minutes,min_notice_hours,timezone")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(appointmentTypeResult.error);
  throwIfSupabaseError(scheduleResult.error);
  throwIfSupabaseError(breaksResult.error);
  throwIfSupabaseError(bookingSettingsResult.error);

  if (!appointmentTypeResult.data || !bookingSettingsResult.data) {
    return [];
  }

  const settings = bookingSettingsResult.data as AvailabilityBookingSettings;
  const now = new Date();
  const searchEnd = addDays(now, settings.booking_horizon_days + 1).toISOString();

  let appointmentsQuery = supabase
    .from("appointments")
    .select("id,start_at,end_at,status")
    .eq("status", "confirmed")
    .lte("start_at", searchEnd)
    .gte("end_at", now.toISOString());

  if (options.excludeAppointmentId) {
    appointmentsQuery = appointmentsQuery.neq("id", options.excludeAppointmentId);
  }

  const [blockedSlotsResult, appointmentsResult] = await Promise.all([
    supabase
      .from("blocked_slots")
      .select("start_at,end_at")
      .lte("start_at", searchEnd)
      .gte("end_at", now.toISOString()),
    appointmentsQuery,
  ]);

  throwIfSupabaseError(blockedSlotsResult.error);
  throwIfSupabaseError(appointmentsResult.error);

  return getAvailableDays({
    appointmentType: appointmentTypeResult.data as AvailabilityAppointmentType,
    schedule: (scheduleResult.data ?? []) as AvailabilityDoctorSchedule[],
    breaks: (breaksResult.data ?? []) as AvailabilityScheduleBreak[],
    blockedSlots: (blockedSlotsResult.data ?? []) as AvailabilityBlockedSlot[],
    appointments: (appointmentsResult.data ?? []) as AvailabilityAppointment[],
    settings,
    now,
  });
}

function throwIfSupabaseError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}
