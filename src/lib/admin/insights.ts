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
};

export type AdminInsights = {
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

export async function getAdminInsights(): Promise<AdminInsights> {
  const supabase = await createAuthorizedAdminClient();

  await completePastConfirmedAppointments();

  const [appointmentsResult, analyticsResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("start_at,status,created_at,appointment_types(name_el)")
      .order("start_at", { ascending: false }),
    supabase
      .from("analytics_events")
      .select("event_type")
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
  const currentMonth = formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM");

  return {
    metrics: {
      totalBookings: appointments.length,
      bookingsThisMonth: appointments.filter(
        (appointment) => formatInTimeZone(appointment.created_at, TIMEZONE, "yyyy-MM") === currentMonth,
      ).length,
      confirmed: countByStatus(appointments, "confirmed"),
      completed: countByStatus(appointments, "completed"),
      cancelled: countByStatus(appointments, "cancelled"),
      noShow: countByStatus(appointments, "no_show"),
    },
    bookingTrend: buildBookingTrend(appointments),
    statusBreakdown: [
      { label: "Επιβεβαιωμένα", value: countByStatus(appointments, "confirmed") },
      { label: "Ολοκληρωμένα", value: countByStatus(appointments, "completed") },
      { label: "Ακυρωμένα", value: countByStatus(appointments, "cancelled") },
      { label: "No-show", value: countByStatus(appointments, "no_show") },
    ],
    mostBookedServices: topRows(
      appointments.map((appointment) => appointment.appointment_types?.name_el ?? "Άλλη θεραπεία"),
    ),
    busiestDays: topRows(
      appointments
        .filter((appointment) => appointment.status !== "cancelled")
        .map((appointment) => dayLabels[formatInTimeZone(appointment.start_at, TIMEZONE, "i")]),
    ),
    busiestHours: topRows(
      appointments
        .filter((appointment) => appointment.status !== "cancelled")
        .map((appointment) => `${formatInTimeZone(appointment.start_at, TIMEZONE, "HH")}:00`),
    ),
    conversionEvents: topRows(analyticsEvents.map((event) => event.event_type)),
  };
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
      label: formatInTimeZone(date, TIMEZONE, "dd/MM"),
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
