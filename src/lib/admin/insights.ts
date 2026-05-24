import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { createAuthorizedAdminClient } from "./auth";
import { completePastConfirmedAppointments } from "./appointments";

const TIMEZONE = "Europe/Athens";

const dayLabels: Record<string, string> = {
  "1": "Δευτέρα",
  "2": "Τρίτη",
  "3": "Τετάρτη",
  "4": "Πέμπτη",
  "5": "Παρασκευή",
  "6": "Σάββατο",
  "7": "Κυριακή",
};

type AppointmentStatus = "confirmed" | "completed" | "cancelled" | "no_show";

type RawInsightAppointment = {
  start_at: string;
  status: AppointmentStatus;
  created_at: string;
  appointment_types:
    | {
        name_el: string;
      }
    | {
        name_el: string;
      }[]
    | null;
};

type RawAnalyticsEvent = {
  event_type: string;
  created_at: string;
};

export type InsightPeriod = "month" | "quarter" | "all";

export type AdminInsights = {
  period: InsightPeriod;
  metrics: {
    totalBookings: number;
    bookingsThisMonth: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  bookingTrend: InsightRow[];
  statusBreakdown: InsightRow[];
  mostBookedServices: InsightRow[];
  busiestDays: InsightRow[];
  busiestHours: InsightRow[];
  conversionEvents: InsightRow[];
};

type InsightRow = {
  label: string;
  value: number;
};

export async function getAdminInsights(period: InsightPeriod = "month"): Promise<AdminInsights> {
  const supabase = await createAuthorizedAdminClient();
  const periodStart = getPeriodStart(period);

  await completePastConfirmedAppointments();

  const [appointmentsResult, analyticsResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("start_at,status,created_at,appointment_types(name_el)")
      .order("start_at", { ascending: false }),
    supabase
      .from("analytics_events")
      .select("event_type,created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (appointmentsResult.error) {
    throw new Error(appointmentsResult.error.message);
  }

  if (analyticsResult.error) {
    throw new Error(analyticsResult.error.message);
  }

  const appointments = ((appointmentsResult.data ?? []) as unknown as RawInsightAppointment[]).map(
    (appointment) => ({
      ...appointment,
      appointment_types: Array.isArray(appointment.appointment_types)
        ? appointment.appointment_types[0] ?? null
        : appointment.appointment_types,
    }),
  );
  const analyticsEvents = (analyticsResult.data ?? []) as RawAnalyticsEvent[];
  const periodAppointments = filterByPeriod(appointments, periodStart, "start_at");
  const createdPeriodAppointments = filterByPeriod(appointments, periodStart, "created_at");
  const periodAnalyticsEvents = filterByPeriod(analyticsEvents, periodStart, "created_at");

  return {
    period,
    metrics: {
      totalBookings: periodAppointments.length,
      bookingsThisMonth: createdPeriodAppointments.length,
      confirmed: countByStatus(periodAppointments, "confirmed"),
      completed: countByStatus(periodAppointments, "completed"),
      cancelled: countByStatus(periodAppointments, "cancelled"),
      noShow: countByStatus(periodAppointments, "no_show"),
    },
    bookingTrend: buildBookingTrend(periodAppointments, period === "month" ? 14 : 30),
    statusBreakdown: [
      { label: "Επιβεβαιωμένα", value: countByStatus(periodAppointments, "confirmed") },
      { label: "Ολοκληρωμένα", value: countByStatus(periodAppointments, "completed") },
      { label: "Ακυρωμένα", value: countByStatus(periodAppointments, "cancelled") },
      { label: "Μη προσέλευση", value: countByStatus(periodAppointments, "no_show") },
    ],
    mostBookedServices: topRows(
      periodAppointments.map((appointment) => appointment.appointment_types?.name_el ?? "Άλλη θεραπεία"),
    ),
    busiestDays: topRows(
      periodAppointments
        .filter((appointment) => appointment.status !== "cancelled")
        .map((appointment) => dayLabels[formatInTimeZone(appointment.start_at, TIMEZONE, "i")]),
    ),
    busiestHours: topRows(
      periodAppointments
        .filter((appointment) => appointment.status !== "cancelled")
        .map((appointment) => `${formatInTimeZone(appointment.start_at, TIMEZONE, "HH")}:00`),
    ),
    conversionEvents: topRows(periodAnalyticsEvents.map((event) => event.event_type)),
  };
}

function getPeriodStart(period: InsightPeriod) {
  const now = new Date();

  if (period === "all") {
    return null;
  }

  if (period === "quarter") {
    const date = new Date(now);
    date.setMonth(date.getMonth() - 3);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function filterByPeriod<T extends Record<K, string>, K extends keyof T>(
  rows: T[],
  periodStart: Date | null,
  dateKey: K,
) {
  if (!periodStart) {
    return rows;
  }

  return rows.filter((row) => new Date(row[dateKey]) >= periodStart);
}

function countByStatus(appointments: RawInsightAppointment[], status: AppointmentStatus) {
  return appointments.filter((appointment) => appointment.status === status).length;
}

function buildBookingTrend(appointments: RawInsightAppointment[], days = 14): InsightRow[] {
  const today = new Date();
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));

    return {
      key: formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd"),
      label: formatInTimeZone(date, TIMEZONE, "d/M"),
      value: 0,
    };
  });

  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  appointments.forEach((appointment) => {
    const key = formatInTimeZone(appointment.created_at, TIMEZONE, "yyyy-MM-dd");
    const bucket = bucketByKey.get(key);

    if (bucket) {
      bucket.value += 1;
    }
  });

  return buckets.map(({ label, value }) => ({ label, value }));
}

function topRows(values: (string | undefined)[], limit = 5): InsightRow[] {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (!value) {
      return acc;
    }

    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}
