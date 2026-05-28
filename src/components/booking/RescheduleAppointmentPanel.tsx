"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { type Locale } from "@/config/locales";
import { type AvailableDay } from "@/lib/booking/availability";
import { type RescheduleAppointmentDetails } from "@/lib/booking/reschedule-data";

const copy = {
  el: {
    title: "Αλλαγή ραντεβού",
    intro: "Επιλέξτε νέα διαθέσιμη ημέρα και ώρα.",
    notFound: "Δεν βρέθηκε ραντεβού για αυτό το link.",
    unavailable: "Αυτό το ραντεβού δεν μπορεί πλέον να αλλάξει online.",
    current: "Τρέχον ραντεβού",
    patient: "Ασθενής",
    email: "Email",
    treatment: "Θεραπεία",
    time: "Ημερομηνία / ώρα",
    chooseDay: "Επιλέξτε νέα ημέρα",
    chooseTime: "Επιλέξτε νέα ώρα",
    loading: "Φόρτωση διαθεσιμότητας...",
    noSlots: "Δεν υπάρχουν διαθέσιμες ώρες.",
    reschedule: "Αλλαγή ραντεβού",
    submitting: "Γίνεται αλλαγή...",
    success: "Το ραντεβού άλλαξε επιτυχώς.",
    error: "Δεν ήταν δυνατή η αλλαγή. Δοκιμάστε ξανά.",
  },
  en: {
    title: "Reschedule appointment",
    intro: "Choose a new available day and time.",
    notFound: "No appointment was found for this link.",
    unavailable: "This appointment can no longer be rescheduled online.",
    current: "Current appointment",
    patient: "Patient",
    email: "Email",
    treatment: "Treatment",
    time: "Date / time",
    chooseDay: "Choose new day",
    chooseTime: "Choose new time",
    loading: "Loading availability...",
    noSlots: "There are no available times.",
    reschedule: "Reschedule appointment",
    submitting: "Rescheduling...",
    success: "The appointment has been rescheduled.",
    error: "Could not reschedule the appointment. Please try again.",
  },
};

export function RescheduleAppointmentPanel({
  locale,
  token,
  appointment,
}: {
  locale: Locale;
  token: string;
  appointment: RescheduleAppointmentDetails | null;
}) {
  const t = copy[locale];
  const [days, setDays] = useState<AvailableDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [isLoading, setIsLoading] = useState(appointment?.status === "confirmed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointment || appointment.status !== "confirmed") {
      return;
    }

    let isActive = true;

    fetch(`/api/booking/reschedule/availability?token=${token}`)
      .then((response) => response.json())
      .then((payload: { days?: AvailableDay[] }) => {
        if (isActive) {
          setDays(payload.days ?? []);
        }
      })
      .catch(() => {
        if (isActive) {
          setDays([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [appointment, token]);

  const selectedDay = days.find((day) => day.date === selectedDate);
  const selectedSlot = selectedDay?.slots.find((slot) => slot.startAt === selectedSlotStart);
  const availableDates = useMemo(() => new Set(days.map((day) => day.date)), [days]);
  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(days.map((day) => day.date.slice(0, 7))));
    return months.length > 0 ? months : [formatMonthKey(new Date())];
  }, [days]);
  const [visibleMonth, setVisibleMonth] = useState(
    selectedDate ? selectedDate.slice(0, 7) : monthOptions[0],
  );
  const activeMonth = monthOptions.includes(visibleMonth)
    ? visibleMonth
    : selectedDate
      ? selectedDate.slice(0, 7)
      : monthOptions[0];
  const activeMonthIndex = Math.max(monthOptions.indexOf(activeMonth), 0);
  const calendarCells = useMemo(() => buildCalendarCells(activeMonth), [activeMonth]);

  async function submitReschedule() {
    if (!selectedSlot || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/booking/reschedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, locale, startAt: selectedSlot.startAt }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error ?? t.error);
      setIsSubmitting(false);
      return;
    }

    setMessage(t.success);
    setIsSubmitting(false);
  }

  if (!appointment) {
    return (
      <RescheduleShell title={t.title} intro={t.intro}>
        <p className="border border-line bg-background p-5 text-sm text-muted">
          {t.notFound}
        </p>
      </RescheduleShell>
    );
  }

  if (appointment.status !== "confirmed") {
    return (
      <RescheduleShell title={t.title} intro={t.intro}>
        <p className="border border-line bg-background p-5 text-sm text-muted">
          {t.unavailable}
        </p>
      </RescheduleShell>
    );
  }

  return (
    <RescheduleShell title={t.title} intro={t.intro}>
      <section>
        <h2 className="text-xl font-semibold">{t.current}</h2>
        <dl className="mt-4 grid gap-3">
          <ReviewRow label={t.patient} value={appointment.patientName} />
          <ReviewRow label={t.email} value={appointment.patientEmail} />
          <ReviewRow label={t.treatment} value={appointment.appointmentTypeName} />
          <ReviewRow label={t.time} value={appointment.appointmentTime} />
        </dl>
      </section>

      <section className="mt-8 border-t border-line pt-8">
        <h2 className="text-xl font-semibold">{t.chooseDay}</h2>
        {isLoading ? <p className="mt-4 text-sm text-muted">{t.loading}</p> : null}
        {!isLoading && days.length === 0 ? (
          <p className="mt-4 border border-line bg-background p-5 text-sm text-muted">
            {t.noSlots}
          </p>
        ) : null}
        <div className="mt-4 rounded-lg border border-line/60 bg-surface p-4">
          <div className="mb-5 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={activeMonthIndex === 0}
              onClick={() => setVisibleMonth(monthOptions[activeMonthIndex - 1] ?? activeMonth)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <h3 className="text-lg font-medium text-foreground">
              {formatMonthLabel(activeMonth, locale)}
            </h3>
            <button
              type="button"
              disabled={activeMonthIndex >= monthOptions.length - 1}
              onClick={() => setVisibleMonth(monthOptions[activeMonthIndex + 1] ?? activeMonth)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next month"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {getWeekdayLabels(locale).map((label, index) => (
              <div
                key={label}
                className={`py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${index >= 5 ? "text-muted/70" : "text-muted"}`}
              >
                {label}
              </div>
            ))}
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="min-h-12" aria-hidden="true" />;
              }

              const isAvailable = availableDates.has(cell.date);
              const isSelected = cell.date === selectedDate;

              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => {
                    setSelectedDate(cell.date);
                    setSelectedSlotStart("");
                  }}
                  className={`min-h-12 rounded-sm border p-1.5 text-sm transition sm:min-h-16 ${
                    isSelected
                      ? "border-accent bg-accent text-surface"
                      : isAvailable
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950 hover:border-accent hover:bg-surface-low"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className="block font-semibold">{cell.dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedDay ? (
        <section className="mt-8 border-t border-line pt-8">
          <h2 className="text-xl font-semibold">{t.chooseTime}</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
            {selectedDay.slots.map((slot) => (
              <button
                key={slot.startAt}
                type="button"
                onClick={() => setSelectedSlotStart(slot.startAt)}
                className={`min-h-10 rounded-sm border px-2 text-xs font-semibold transition sm:min-h-11 sm:px-4 sm:text-sm ${
                  slot.startAt === selectedSlotStart
                    ? "border-foreground bg-foreground text-background"
                    : "border-line bg-surface hover:border-accent"
                }`}
              >
                {slot.localTime}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        disabled={!selectedSlot || isSubmitting || Boolean(message)}
        onClick={submitReschedule}
        className="mt-8 min-h-12 bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t.submitting : t.reschedule}
      </button>

      {message ? (
        <p className="mt-4 border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </RescheduleShell>
  );
}

function RescheduleShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-sm uppercase tracking-[0.22em] text-accent">Secure link</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{intro}</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <div className="border border-line bg-surface p-5 sm:p-8">{children}</div>
      </section>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border border-line bg-background p-4 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}

function buildCalendarCells(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1, 12);
  const lastDay = new Date(year, month, 0, 12);
  const leadingEmptyCells = (firstDay.getDay() + 6) % 7;
  const cells: Array<{ date: string; dayNumber: number } | null> = Array.from(
    { length: leadingEmptyCells },
    () => null,
  );

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month - 1, day, 12);
    cells.push({
      date: formatLocalDate(date),
      dayNumber: day,
    });
  }

  return cells;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthKey(date: Date) {
  return formatLocalDate(date).slice(0, 7);
}

function formatMonthLabel(monthKey: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T12:00:00`));
}

function getWeekdayLabels(locale: Locale) {
  return locale === "el"
    ? ["ΔΕ", "ΤΡ", "ΤΕ", "ΠΕ", "ΠΑ", "ΣΑ", "ΚΥ"]
    : ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
}
