import { addDays, addMinutes, isBefore } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export type AvailabilityAppointmentType = {
  id: string;
  duration_minutes: number;
  is_active: boolean;
};

export type AvailabilityDoctorSchedule = {
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type AvailabilityScheduleBreak = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type AvailabilityBlockedSlot = {
  start_at: string;
  end_at: string;
};

export type AvailabilityAppointment = {
  start_at: string;
  end_at: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
};

export type AvailabilityBookingSettings = {
  booking_horizon_days: number;
  buffer_minutes: number;
  min_notice_hours: number;
  timezone: string;
};

export type AvailabilityInput = {
  appointmentType: AvailabilityAppointmentType;
  schedule: AvailabilityDoctorSchedule[];
  breaks: AvailabilityScheduleBreak[];
  blockedSlots: AvailabilityBlockedSlot[];
  appointments: AvailabilityAppointment[];
  settings: AvailabilityBookingSettings;
  now?: Date;
  slotStepMinutes?: number;
  includeUnavailableDays?: boolean;
};

export type AvailableSlot = {
  startAt: string;
  endAt: string;
  localDate: string;
  localTime: string;
};

export type AvailableDay = {
  date: string;
  slots: AvailableSlot[];
  status: "available" | "closed" | "full";
};

export function getAvailableDays(input: AvailabilityInput): AvailableDay[] {
  const {
    appointmentType,
    schedule,
    breaks,
    blockedSlots,
    appointments,
    settings,
    now = new Date(),
    slotStepMinutes = 15,
    includeUnavailableDays = false,
  } = input;

  if (!appointmentType.is_active) {
    return [];
  }

  const timezone = settings.timezone || "Europe/Athens";
  const minStartAt = addMinutes(now, settings.min_notice_hours * 60);
  const busyIntervals = buildBusyIntervals({
    appointments,
    blockedSlots,
    bufferMinutes: settings.buffer_minutes,
  });

  return getLocalDateRange(now, settings.booking_horizon_days, timezone)
    .map((date) => {
      const dayOfWeek = getDayOfWeek(date, timezone);
      const daySchedule = schedule.find((item) => item.day_of_week === dayOfWeek);

      if (!daySchedule?.is_working || !daySchedule.start_time || !daySchedule.end_time) {
        return { date, slots: [], status: "closed" as const };
      }

      const workingStart = localDateTimeToUtc(date, daySchedule.start_time, timezone);
      const workingEnd = localDateTimeToUtc(date, daySchedule.end_time, timezone);
      const dayBreaks = breaks
        .filter((item) => item.day_of_week === dayOfWeek)
        .map((item) => ({
          start: localDateTimeToUtc(date, item.start_time, timezone),
          end: localDateTimeToUtc(date, item.end_time, timezone),
        }));

      const slots: AvailableSlot[] = [];
      let cursor = workingStart;

      while (true) {
        const slotStart = cursor;
        const slotEnd = addMinutes(slotStart, appointmentType.duration_minutes);

        if (slotEnd > workingEnd) {
          break;
        }

        const candidate = { start: slotStart, end: slotEnd };
        const isAllowed =
          !isBefore(slotStart, minStartAt) &&
          !overlapsAny(candidate, dayBreaks) &&
          !overlapsAny(candidate, busyIntervals);

        if (isAllowed) {
          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            localDate: date,
            localTime: formatInTimeZone(slotStart, timezone, "HH:mm"),
          });
        }

        cursor = addMinutes(cursor, slotStepMinutes);
      }

      return {
        date,
        slots,
        status: slots.length > 0 ? ("available" as const) : ("full" as const),
      };
    })
    .filter((day) => includeUnavailableDays || day.slots.length > 0);
}

function buildBusyIntervals({
  appointments,
  blockedSlots,
  bufferMinutes,
}: {
  appointments: AvailabilityAppointment[];
  blockedSlots: AvailabilityBlockedSlot[];
  bufferMinutes: number;
}) {
  const appointmentIntervals = appointments
    .filter((appointment) => appointment.status === "confirmed")
    .map((appointment) => ({
      start: addMinutes(new Date(appointment.start_at), -bufferMinutes),
      end: addMinutes(new Date(appointment.end_at), bufferMinutes),
    }));

  const blockedIntervals = blockedSlots.map((slot) => ({
    start: new Date(slot.start_at),
    end: new Date(slot.end_at),
  }));

  return [...appointmentIntervals, ...blockedIntervals];
}

function getLocalDateRange(now: Date, horizonDays: number, timezone: string) {
  const firstLocalDate = formatInTimeZone(now, timezone, "yyyy-MM-dd");
  const firstLocalNoon = fromZonedTime(`${firstLocalDate}T12:00:00`, timezone);

  return Array.from({ length: horizonDays + 1 }, (_, index) => {
    const day = addDays(firstLocalNoon, index);
    return formatInTimeZone(day, timezone, "yyyy-MM-dd");
  });
}

function getDayOfWeek(localDate: string, timezone: string) {
  return toZonedTime(fromZonedTime(`${localDate}T12:00:00`, timezone), timezone).getDay();
}

function localDateTimeToUtc(localDate: string, localTime: string, timezone: string) {
  return fromZonedTime(`${localDate}T${normalizeTime(localTime)}:00`, timezone);
}

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function overlapsAny(
  candidate: { start: Date; end: Date },
  intervals: Array<{ start: Date; end: Date }>,
) {
  return intervals.some((interval) => candidate.start < interval.end && candidate.end > interval.start);
}
