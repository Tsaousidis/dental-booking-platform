"use client";

import { useEffect, useState } from "react";

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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedSlotStart("");
              }}
              className={`min-h-20 border p-4 text-left transition ${
                day.date === selectedDate
                  ? "border-foreground bg-background"
                  : "border-line bg-surface hover:border-accent"
              }`}
            >
              <span className="block text-sm font-semibold">{formatDate(day.date, locale)}</span>
              <span className="mt-2 block text-xs text-muted">{day.slots.length} slots</span>
            </button>
          ))}
        </div>
      </section>

      {selectedDay ? (
        <section className="mt-8 border-t border-line pt-8">
          <h2 className="text-xl font-semibold">{t.chooseTime}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedDay.slots.map((slot) => (
              <button
                key={slot.startAt}
                type="button"
                onClick={() => setSelectedSlotStart(slot.startAt)}
                className={`min-h-11 border px-4 text-sm font-semibold transition ${
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

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}
