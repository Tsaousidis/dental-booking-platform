import "server-only";

import { fromZonedTime } from "date-fns-tz";
import { revalidatePath } from "next/cache";

import { writeAdminAuditLog } from "./audit-log";
import { createAuthorizedAdminClient, createAuthorizedAdminContext } from "./auth";

const DEFAULT_TIMEZONE = "Europe/Athens";

export type DoctorProfile = {
  id: string;
  doctor_name: string;
  clinic_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  timezone: string;
};

export type BookingSettings = {
  id: string;
  booking_horizon_days: number;
  buffer_minutes: number;
  min_notice_hours: number;
  timezone: string;
};

export type AppointmentType = {
  id: string;
  name_el: string;
  name_en: string;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
};

export type DoctorSchedule = {
  id: string;
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type ScheduleBreak = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type BlockedSlot = {
  id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
};

export type GoogleCalendarConnection = {
  google_account_email: string | null;
  calendar_id: string | null;
  is_connected: boolean;
};

export type NotificationSettings = {
  id: string;
  doctor_new_booking_email_enabled: boolean;
  doctor_reminder_email_enabled: boolean;
  doctor_cancellation_email_enabled: boolean;
  doctor_reschedule_email_enabled: boolean;
  patient_confirmation_email_enabled: boolean;
  patient_reminder_email_enabled: boolean;
  patient_cancellation_email_enabled: boolean;
  patient_reschedule_email_enabled: boolean;
  reminder_hours_before: number;
};

export type AdminSettingsData = {
  doctorProfile: DoctorProfile | null;
  bookingSettings: BookingSettings | null;
  notificationSettings: NotificationSettings | null;
  appointmentTypes: AppointmentType[];
  doctorSchedule: DoctorSchedule[];
  scheduleBreaks: ScheduleBreak[];
  blockedSlots: BlockedSlot[];
  googleCalendarConnection: GoogleCalendarConnection | null;
};

export async function getAdminSettings(): Promise<AdminSettingsData> {
  const supabase = await createAuthorizedAdminClient();

  const [
    doctorProfileResult,
    bookingSettingsResult,
    notificationSettingsResult,
    appointmentTypesResult,
    doctorScheduleResult,
    scheduleBreaksResult,
    blockedSlotsResult,
    googleCalendarConnectionResult,
  ] = await Promise.all([
    supabase.from("doctor_profile").select("*").order("created_at").limit(1).maybeSingle(),
    supabase.from("booking_settings").select("*").order("created_at").limit(1).maybeSingle(),
    supabase
      .from("notification_settings")
      .select("*")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("appointment_types")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("doctor_schedule")
      .select("*")
      .order("day_of_week", { ascending: true }),
    supabase
      .from("schedule_breaks")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase
      .from("blocked_slots")
      .select("*")
      .order("start_at", { ascending: true }),
    supabase
      .from("google_calendar_connections")
      .select("google_account_email,calendar_id,is_connected")
      .eq("is_connected", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(doctorProfileResult.error);
  throwIfSupabaseError(bookingSettingsResult.error);
  throwIfSupabaseError(notificationSettingsResult.error);
  throwIfSupabaseError(appointmentTypesResult.error);
  throwIfSupabaseError(doctorScheduleResult.error);
  throwIfSupabaseError(scheduleBreaksResult.error);
  throwIfSupabaseError(blockedSlotsResult.error);
  throwIfSupabaseError(googleCalendarConnectionResult.error);

  return {
    doctorProfile: doctorProfileResult.data,
    bookingSettings: bookingSettingsResult.data,
    notificationSettings: notificationSettingsResult.data,
    appointmentTypes: appointmentTypesResult.data ?? [],
    doctorSchedule: doctorScheduleResult.data ?? [],
    scheduleBreaks: scheduleBreaksResult.data ?? [],
    blockedSlots: blockedSlotsResult.data ?? [],
    googleCalendarConnection: googleCalendarConnectionResult.data,
  };
}

export async function saveAdminSettings(formData: FormData) {
  "use server";

  const { supabase, user } = await createAuthorizedAdminContext();

  const doctorProfileId = getRequiredValue(formData, "doctor_profile_id");
  const bookingSettingsId = getRequiredValue(formData, "booking_settings_id");
  const notificationSettingsId = getOptionalValue(formData, "notification_settings_id");
  const appointmentTypeIds = getCsvIds(formData, "appointment_type_ids");
  const scheduleIds = getCsvIds(formData, "schedule_ids");
  const breakIds = getCsvIds(formData, "break_ids");
  const blockedSlotIds = getCsvIds(formData, "blocked_slot_ids");

  const doctorProfile = {
    doctor_name: getRequiredValue(formData, "doctor_name"),
    clinic_name: getRequiredValue(formData, "clinic_name"),
    email: getRequiredValue(formData, "email"),
    phone: getRequiredValue(formData, "phone"),
    address: getRequiredValue(formData, "address"),
    city: getRequiredValue(formData, "city"),
    timezone: getRequiredValue(formData, "profile_timezone"),
  };

  const bookingSettings = {
    booking_horizon_days: getPositiveInteger(formData, "booking_horizon_days"),
    buffer_minutes: getNonNegativeInteger(formData, "buffer_minutes"),
    min_notice_hours: getNonNegativeInteger(formData, "min_notice_hours"),
    timezone: getRequiredValue(formData, "booking_timezone"),
  };

  const notificationSettings = notificationSettingsId
    ? {
        doctor_new_booking_email_enabled:
          formData.get("doctor_new_booking_email_enabled") === "on",
        doctor_reminder_email_enabled:
          formData.get("doctor_reminder_email_enabled") === "on",
        doctor_cancellation_email_enabled:
          formData.get("doctor_cancellation_email_enabled") === "on",
        doctor_reschedule_email_enabled:
          formData.get("doctor_reschedule_email_enabled") === "on",
        patient_confirmation_email_enabled:
          formData.get("patient_confirmation_email_enabled") === "on",
        patient_reminder_email_enabled:
          formData.get("patient_reminder_email_enabled") === "on",
        patient_cancellation_email_enabled:
          formData.get("patient_cancellation_email_enabled") === "on",
        patient_reschedule_email_enabled:
          formData.get("patient_reschedule_email_enabled") === "on",
        reminder_hours_before: getPositiveInteger(formData, "reminder_hours_before"),
      }
    : null;

  const timezone = bookingSettings.timezone || DEFAULT_TIMEZONE;

  const { error: doctorProfileError } = await supabase
    .from("doctor_profile")
    .update(doctorProfile)
    .eq("id", doctorProfileId);
  throwIfSupabaseError(doctorProfileError);

  const { error: bookingSettingsError } = await supabase
    .from("booking_settings")
    .update(bookingSettings)
    .eq("id", bookingSettingsId);
  throwIfSupabaseError(bookingSettingsError);

  if (notificationSettings && notificationSettingsId) {
    const { error: notificationSettingsError } = await supabase
      .from("notification_settings")
      .update(notificationSettings)
      .eq("id", notificationSettingsId);
    throwIfSupabaseError(notificationSettingsError);
  }

  await Promise.all([
    ...appointmentTypeIds.map((id) => updateAppointmentType(formData, id)),
    ...scheduleIds.map((id) => updateDoctorSchedule(formData, id)),
    ...breakIds.map((id) => updateScheduleBreak(formData, id)),
    ...blockedSlotIds.map((id) => updateBlockedSlot(formData, id, timezone)),
  ]);

  await createNewAppointmentType(formData);
  await createNewScheduleBreak(formData);
  await createNewBlockedSlot(formData, timezone);

  await writeAdminAuditLog({
    adminEmail: user.email,
    action: "settings_updated",
    entityType: "settings",
    metadata: {
      appointment_types: appointmentTypeIds.length,
      schedule_days: scheduleIds.length,
      breaks: breakIds.length,
      blocked_slots: blockedSlotIds.length,
    },
  });

  revalidatePath("/admin/settings");
}

async function updateAppointmentType(formData: FormData, id: string) {
  const supabase = await createAuthorizedAdminClient();

  if (formData.get(`appointment_type_${id}_delete`) === "on") {
    const { error } = await supabase.from("appointment_types").delete().eq("id", id);
    throwIfSupabaseError(error);
    return;
  }

  const { error } = await supabase
    .from("appointment_types")
    .update({
      name_el: getRequiredValue(formData, `appointment_type_${id}_name_el`),
      name_en: getRequiredValue(formData, `appointment_type_${id}_name_en`),
      duration_minutes: getPositiveInteger(
        formData,
        `appointment_type_${id}_duration_minutes`,
      ),
      sort_order: getNonNegativeInteger(formData, `appointment_type_${id}_sort_order`),
      is_active: formData.get(`appointment_type_${id}_is_active`) === "on",
    })
    .eq("id", id);

  throwIfSupabaseError(error);
}

async function createNewAppointmentType(formData: FormData) {
  const nameEl = getOptionalValue(formData, "new_appointment_type_name_el");
  const nameEn = getOptionalValue(formData, "new_appointment_type_name_en");
  const duration = getOptionalValue(formData, "new_appointment_type_duration_minutes");

  if (!nameEl && !nameEn && !duration) {
    return;
  }

  if (!nameEl || !nameEn || !duration) {
    throw new Error("Για νέο τύπο ραντεβού συμπληρώστε όνομα στα Ελληνικά, όνομα στα Αγγλικά και διάρκεια.");
  }

  const supabase = await createAuthorizedAdminClient();
  const { data: lastAppointmentType, error: lastAppointmentTypeError } = await supabase
    .from("appointment_types")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfSupabaseError(lastAppointmentTypeError);

  const { error } = await supabase.from("appointment_types").insert({
    name_el: nameEl,
    name_en: nameEn,
    duration_minutes: getPositiveInteger(formData, "new_appointment_type_duration_minutes"),
    is_active: true,
    sort_order: (lastAppointmentType?.sort_order ?? 0) + 10,
  });

  throwIfSupabaseError(error);
}

async function updateDoctorSchedule(formData: FormData, id: string) {
  const supabase = await createAuthorizedAdminClient();
  const isWorking = formData.get(`schedule_${id}_is_working`) === "on";
  const startTime = getOptionalValue(formData, `schedule_${id}_start_time`);
  const endTime = getOptionalValue(formData, `schedule_${id}_end_time`);

  if (isWorking && (!startTime || !endTime)) {
    throw new Error("Οι εργάσιμες ημέρες χρειάζονται ώρα έναρξης και λήξης.");
  }

  const { error } = await supabase
    .from("doctor_schedule")
    .update({
      is_working: isWorking,
      start_time: isWorking ? startTime : null,
      end_time: isWorking ? endTime : null,
    })
    .eq("id", id);

  throwIfSupabaseError(error);
}

async function updateScheduleBreak(formData: FormData, id: string) {
  const supabase = await createAuthorizedAdminClient();

  if (formData.get(`break_${id}_delete`) === "on") {
    const { error } = await supabase.from("schedule_breaks").delete().eq("id", id);
    throwIfSupabaseError(error);
    return;
  }

  const { error } = await supabase
    .from("schedule_breaks")
    .update({
      day_of_week: getNonNegativeInteger(formData, `break_${id}_day_of_week`),
      start_time: getRequiredValue(formData, `break_${id}_start_time`),
      end_time: getRequiredValue(formData, `break_${id}_end_time`),
    })
    .eq("id", id);

  throwIfSupabaseError(error);
}

async function createNewScheduleBreak(formData: FormData) {
  const day = getOptionalValue(formData, "new_break_day_of_week");
  const startTime = getOptionalValue(formData, "new_break_start_time");
  const endTime = getOptionalValue(formData, "new_break_end_time");

  if (!day && !startTime && !endTime) {
    return;
  }

  if (!day || !startTime || !endTime) {
    throw new Error("Για νέο διάλειμμα συμπληρώστε ημέρα, έναρξη και λήξη.");
  }

  const supabase = await createAuthorizedAdminClient();
  const { error } = await supabase.from("schedule_breaks").insert({
    day_of_week: Number(day),
    start_time: startTime,
    end_time: endTime,
  });

  throwIfSupabaseError(error);
}

async function updateBlockedSlot(formData: FormData, id: string, timezone: string) {
  const supabase = await createAuthorizedAdminClient();

  if (formData.get(`blocked_${id}_delete`) === "on") {
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    throwIfSupabaseError(error);
    return;
  }

  const { error } = await supabase
    .from("blocked_slots")
    .update({
      start_at: toUtcIso(getDateTimeValue(formData, `blocked_${id}_start_at`), timezone),
      end_at: toUtcIso(getDateTimeValue(formData, `blocked_${id}_end_at`), timezone),
      reason: getOptionalValue(formData, `blocked_${id}_reason`),
    })
    .eq("id", id);

  throwIfSupabaseError(error);
}

async function createNewBlockedSlot(formData: FormData, timezone: string) {
  const startDate = getOptionalValue(formData, "new_blocked_start_at_date");
  const startTime = getOptionalValue(formData, "new_blocked_start_at_time");
  const endDate = getOptionalValue(formData, "new_blocked_end_at_date");
  const endTime = getOptionalValue(formData, "new_blocked_end_at_time");
  const reason = getOptionalValue(formData, "new_blocked_reason");

  if (!startDate && !startTime && !endDate && !endTime && !reason) {
    return;
  }

  if (!startDate || !startTime || !endDate || !endTime) {
    throw new Error("Για νέο μη διαθέσιμο διάστημα συμπληρώστε ημερομηνία και ώρα έναρξης/λήξης.");
  }

  const supabase = await createAuthorizedAdminClient();
  const { error } = await supabase.from("blocked_slots").insert({
    start_at: toUtcIso(toLocalDateTime(startDate, startTime), timezone),
    end_at: toUtcIso(toLocalDateTime(endDate, endTime), timezone),
    reason,
  });

  throwIfSupabaseError(error);
}

function getCsvIds(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getRequiredValue(formData: FormData, key: string) {
  const value = getOptionalValue(formData, key);

  if (!value) {
    throw new Error(`Το πεδίο ${key} είναι υποχρεωτικό.`);
  }

  return value;
}

function getDateTimeValue(formData: FormData, key: string) {
  const existingValue = getOptionalValue(formData, key);

  if (existingValue) {
    return existingValue;
  }

  return toLocalDateTime(
    getRequiredValue(formData, `${key}_date`),
    getRequiredValue(formData, `${key}_time`),
  );
}

function toLocalDateTime(date: string, time: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);

  if (!match) {
    throw new Error("Η ημερομηνία πρέπει να είναι στη μορφή dd/mm/yyyy.");
  }

  const [, day, month, year] = match;

  return `${year}-${month}-${day}T${time}`;
}

function getOptionalValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getPositiveInteger(formData: FormData, key: string) {
  const value = Number(getRequiredValue(formData, key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Το πεδίο ${key} πρέπει να είναι θετικός ακέραιος.`);
  }

  return value;
}

function getNonNegativeInteger(formData: FormData, key: string) {
  const value = Number(getRequiredValue(formData, key));

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Το πεδίο ${key} πρέπει να είναι μηδέν ή μεγαλύτερο.`);
  }

  return value;
}

function toUtcIso(value: string, timezone: string) {
  return fromZonedTime(value, timezone).toISOString();
}

function throwIfSupabaseError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}
