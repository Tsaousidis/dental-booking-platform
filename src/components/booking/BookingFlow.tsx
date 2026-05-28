"use client";

import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { type Locale } from "@/config/locales";
import { type AvailableDay, type AvailableSlot } from "@/lib/booking/availability";
import { type PublicAppointmentType } from "@/lib/booking/appointment-types";

import { TurnstileWidget } from "./TurnstileWidget";

type BookingFlowCopy = {
  title: string;
  intro: string;
  treatment: string;
  day: string;
  time: string;
  details: string;
  confirmation: string;
  chooseTreatment: string;
  chooseDay: string;
  chooseTime: string;
  patientDetails: string;
  fullName: string;
  email: string;
  phone: string;
  note: string;
  notePlaceholder: string;
  next: string;
  back: string;
  loading: string;
  noSlots: string;
  reviewTitle: string;
  confirm: string;
  backendPending: string;
  bookingSuccess: string;
  bookingError: string;
  captchaError: string;
  submitting: string;
  minutes: string;
  availableLabel: string;
  closedLabel: string;
  pastLabel: string;
  fullyBookedLabel: string;
  todayLabel: string;
  confirmationReassurance: string;
  privacyNote: string;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const copyByLocale: Record<Locale, BookingFlowCopy> = {
  el: {
    title: "Κλείστε ραντεβού",
    intro: "Επιλέξτε θεραπεία, ημέρα, ώρα και συμπληρώστε τα στοιχεία σας.",
    treatment: "Θεραπεία",
    day: "Ημέρα",
    time: "Ώρα",
    details: "Στοιχεία",
    confirmation: "Επιβεβαίωση",
    chooseTreatment: "Επιλέξτε θεραπεία",
    chooseDay: "Επιλέξτε ημέρα",
    chooseTime: "Επιλέξτε ώρα",
    patientDetails: "Στοιχεία ασθενή",
    fullName: "Ονοματεπώνυμο",
    email: "Email",
    phone: "Τηλέφωνο",
    note: "Σημείωση",
    notePlaceholder: "Προαιρετική σημείωση για την επίσκεψη",
    next: "Συνέχεια",
    back: "Πίσω",
    loading: "Φόρτωση διαθεσιμότητας...",
    noSlots: "Δεν υπάρχουν διαθέσιμες ώρες για αυτή τη θεραπεία.",
    reviewTitle: "Έλεγχος ραντεβού",
    confirm: "Επιβεβαίωση ραντεβού",
    backendPending: "Ελέγξτε τα στοιχεία σας και επιβεβαιώστε το ραντεβού.",
    bookingSuccess: "Το ραντεβού επιβεβαιώθηκε.",
    bookingError: "Δεν ήταν δυνατή η δημιουργία του ραντεβού. Δοκιμάστε άλλη ώρα.",
    captchaError: "Ο έλεγχος ασφαλείας δεν ολοκληρώθηκε.",
    submitting: "Γίνεται επιβεβαίωση...",
    minutes: "λεπτά",
    availableLabel: "Διαθέσιμο",
    closedLabel: "Κλειστό",
    pastLabel: "Πέρασε",
    fullyBookedLabel: "Πλήρες",
    todayLabel: "Σήμερα",
    confirmationReassurance: "Θα λάβετε email επιβεβαίωσης αμέσως μετά την ολοκλήρωση του ραντεβού.",
    privacyNote: "Η κλινική μπορεί να τηρεί ιστορικό ραντεβού και εσωτερικές σημειώσεις σχετικές με τη συνέχεια της φροντίδας σας. Μπορείτε να ζητήσετε πρόσβαση ή διαγραφή σύμφωνα με την Πολιτική Απορρήτου.",
  },
  en: {
    title: "Book appointment",
    intro: "Choose a treatment, day, time, and enter your details.",
    treatment: "Treatment",
    day: "Day",
    time: "Time",
    details: "Details",
    confirmation: "Confirmation",
    chooseTreatment: "Choose treatment",
    chooseDay: "Choose day",
    chooseTime: "Choose time",
    patientDetails: "Patient details",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    note: "Note",
    notePlaceholder: "Optional note for the visit",
    next: "Continue",
    back: "Back",
    loading: "Loading availability...",
    noSlots: "There are no available times for this treatment.",
    reviewTitle: "Review appointment",
    confirm: "Confirm appointment",
    backendPending: "Review your details and confirm the appointment.",
    bookingSuccess: "Your appointment has been confirmed.",
    bookingError: "Could not create the appointment. Please try another time.",
    captchaError: "The security check was not completed.",
    submitting: "Confirming...",
    minutes: "minutes",
    availableLabel: "Available",
    closedLabel: "Closed",
    pastLabel: "Past",
    fullyBookedLabel: "Fully booked",
    todayLabel: "Today",
    confirmationReassurance: "You will receive a confirmation email immediately after the appointment is booked.",
    privacyNote: "The clinic may keep appointment history and internal notes related to continuity of care. You may request access or deletion according to the Privacy Policy.",
  },
};

const steps = ["treatment", "day", "time", "details", "confirmation"] as const;

export function BookingFlow({
  locale,
  appointmentTypes,
}: {
  locale: Locale;
  appointmentTypes: PublicAppointmentType[];
}) {
  const copy = copyByLocale[locale];
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTypeId, setSelectedTypeId] = useState(appointmentTypes[0]?.id ?? "");
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(appointmentTypes[0]?.id));
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState("");
  const [confirmedSlot, setConfirmedSlot] = useState<AvailableSlot | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [availabilityRefreshKey, setAvailabilityRefreshKey] = useState(0);

  const selectedType = useMemo(
    () => appointmentTypes.find((type) => type.id === selectedTypeId),
    [appointmentTypes, selectedTypeId],
  );

  const selectedDay = availableDays.find((day) => day.date === selectedDate);
  const selectedSlot = selectedDay?.slots.find((slot) => slot.startAt === selectedSlotStart);

  useEffect(() => {
    if (!selectedTypeId) {
      return;
    }

    let isActive = true;

    fetch(
      `/api/booking/availability?appointmentTypeId=${selectedTypeId}&refresh=${availabilityRefreshKey}`,
      { cache: "no-store" },
    )
      .then((response) => response.json())
      .then((payload: { days?: AvailableDay[] }) => {
        if (isActive) {
          const days = payload.days ?? [];

          setAvailableDays(days);
          setSelectedDate((currentDate) =>
            currentDate && days.some((day) => day.date === currentDate && isBookableDay(day))
              ? currentDate
              : "",
          );
          setSelectedSlotStart((currentSlot) =>
            currentSlot &&
            days.some((day) => day.slots.some((slot) => slot.startAt === currentSlot))
              ? currentSlot
              : "",
          );
        }
      })
      .catch(() => {
        if (isActive) {
          setAvailableDays([]);
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
  }, [availabilityRefreshKey, selectedTypeId]);

  useEffect(() => {
    function refreshAvailability() {
      if (document.visibilityState !== "visible" || !selectedTypeId) {
        return;
      }

      setIsLoading(true);
      setAvailabilityRefreshKey((key) => key + 1);
    }

    window.addEventListener("focus", refreshAvailability);
    document.addEventListener("visibilitychange", refreshAvailability);

    return () => {
      window.removeEventListener("focus", refreshAvailability);
      document.removeEventListener("visibilitychange", refreshAvailability);
    };
  }, [selectedTypeId]);

  function handleTreatmentSelect(value: string) {
    setSelectedTypeId(value);
    setAvailableDays([]);
    setSelectedDate("");
    setSelectedSlotStart("");
    setIsLoading(true);
  }

  function canContinue() {
    if (activeStep === 0) return Boolean(selectedTypeId);
    if (activeStep === 1) return Boolean(selectedDate);
    if (activeStep === 2) return Boolean(selectedSlotStart);
    if (activeStep === 3) return Boolean(patientName && patientEmail && patientPhone);
    return false;
  }

  async function handleSubmitBooking() {
    if (!selectedType || !selectedSlot || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    if (turnstileSiteKey && !captchaToken) {
      setSubmitError(copy.captchaError);
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locale,
        appointmentTypeId: selectedType.id,
        startAt: selectedSlot.startAt,
        patientName,
        patientEmail,
        patientPhone,
        patientNote,
        captchaToken,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setSubmitError(payload?.error ?? copy.bookingError);
      setIsSubmitting(false);
      return;
    }

    if (payload?.appointment?.confirmationUrl) {
      router.push(payload.appointment.confirmationUrl);
      return;
    }

    setConfirmedAppointmentId(payload.appointment.id);
    setConfirmedSlot(selectedSlot);
    setIsSubmitting(false);
  }

  return (
    <div className="bg-background">
      <section className="border-b border-line/30 bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="label-caps text-accent">Online booking</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{copy.intro}</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-line/50 bg-surface p-4 ambient-shadow lg:sticky lg:top-28 lg:self-start">
          <div className="grid gap-2">
            {[copy.treatment, copy.day, copy.time, copy.details, copy.confirmation].map(
              (label, index) => (
                <div
                  key={label}
                  className={`flex min-h-11 items-center gap-3 rounded-sm border px-3 text-sm font-semibold transition ${
                    index === activeStep
                      ? "border-accent bg-accent text-surface"
                      : index < activeStep
                        ? "border-champagne bg-background text-foreground"
                        : "border-line/70 bg-background text-muted"
                  }`}
                >
                  {index < activeStep ? <Check size={16} /> : <span>{index + 1}</span>}
                  {label}
                </div>
              ),
            )}
          </div>
        </aside>

        <div className="rounded-lg border border-line/50 bg-surface p-5 ambient-shadow sm:p-8">
          {activeStep === 0 ? (
            <StepTreatment
              copy={copy}
              appointmentTypes={appointmentTypes}
              selectedTypeId={selectedTypeId}
              onSelect={handleTreatmentSelect}
            />
          ) : null}

          {activeStep === 1 ? (
            <StepDay
              copy={copy}
              locale={locale}
              days={availableDays}
              selectedDate={selectedDate}
              isLoading={isLoading}
              onSelect={setSelectedDate}
            />
          ) : null}

          {activeStep === 2 ? (
            <StepTime
              copy={copy}
              slots={selectedDay?.slots ?? []}
              selectedSlotStart={selectedSlotStart}
              onSelect={setSelectedSlotStart}
            />
          ) : null}

          {activeStep === 3 ? (
            <StepDetails
              copy={copy}
              patientName={patientName}
              patientEmail={patientEmail}
              patientPhone={patientPhone}
              patientNote={patientNote}
              setPatientName={setPatientName}
              setPatientEmail={setPatientEmail}
              setPatientPhone={setPatientPhone}
              setPatientNote={setPatientNote}
            />
          ) : null}

          {activeStep === 4 ? (
            <StepConfirmation
              copy={copy}
              locale={locale}
              appointmentType={selectedType}
              slot={confirmedSlot ?? selectedSlot}
              patientName={patientName}
              patientEmail={patientEmail}
              patientPhone={patientPhone}
              patientNote={patientNote}
              confirmedAppointmentId={confirmedAppointmentId}
              submitError={submitError}
              captchaToken={captchaToken}
              onCaptchaVerify={setCaptchaToken}
              onCaptchaExpire={() => setCaptchaToken("")}
            />
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line/60 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
              className="min-h-12 rounded-sm border border-line px-5 text-sm font-semibold transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.back}
            </button>
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                disabled={!canContinue()}
                onClick={() => setActiveStep((step) => Math.min(step + 1, steps.length - 1))}
                className="min-h-12 rounded-sm bg-accent px-6 text-sm font-semibold text-surface transition hover:scale-[1.02] hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.next}
              </button>
            ) : (
              <button
                type="button"
                disabled={Boolean(confirmedAppointmentId) || isSubmitting}
                onClick={handleSubmitBooking}
                className="min-h-12 rounded-sm bg-accent px-6 text-sm font-semibold text-surface transition hover:scale-[1.02] hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? copy.submitting : copy.confirm}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StepTreatment({
  copy,
  appointmentTypes,
  selectedTypeId,
  onSelect,
}: {
  copy: BookingFlowCopy;
  appointmentTypes: PublicAppointmentType[];
  selectedTypeId: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <StepHeading icon={<CalendarDays size={20} />} title={copy.chooseTreatment} />
      <div className="mt-6 grid gap-2 md:grid-cols-2 md:gap-3">
        {appointmentTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className={`flex min-h-16 items-center justify-between gap-4 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 md:block md:min-h-32 md:p-5 ${
              type.id === selectedTypeId
                ? "border-accent bg-surface-low"
                : "border-line/70 bg-surface hover:border-accent"
            }`}
          >
            <span className="text-base font-semibold md:text-lg md:font-medium">{type.name}</span>
            <span className="shrink-0 text-sm text-muted md:mt-4 md:block">
              {type.durationMinutes} {copy.minutes}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDay({
  copy,
  locale,
  days,
  selectedDate,
  isLoading,
  onSelect,
}: {
  copy: BookingFlowCopy;
  locale: Locale;
  days: AvailableDay[];
  selectedDate: string;
  isLoading: boolean;
  onSelect: (value: string) => void;
}) {
  const daysByDate = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
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
  const todayDate = useMemo(() => formatLocalDate(new Date()), []);

  return (
    <div>
      <StepHeading icon={<CalendarDays size={20} />} title={copy.chooseDay} />
      {isLoading ? <p className="mt-6 text-sm text-muted">{copy.loading}</p> : null}
      {!isLoading && days.length === 0 ? (
        <p className="mt-6 rounded-lg border border-line/70 bg-background p-5 text-sm text-muted">
          {copy.noSlots}
        </p>
      ) : null}
      {days.length > 0 ? (
        <div className="mt-6 rounded-lg border border-line/60 bg-surface p-4 sm:p-6">
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

          <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
            {getWeekdayLabels(locale).map((label, index) => (
              <div
                key={label}
                className={`label-caps py-2 ${index >= 5 ? "text-muted/70" : "text-muted"}`}
              >
                {label}
              </div>
            ))}
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="min-h-14" aria-hidden="true" />;
              }

              const day = daysByDate.get(cell.date);
              const isAvailable = Boolean(day && isBookableDay(day));
              const isSelected = cell.date === selectedDate;
              const isPast = cell.date < todayDate;
              const isToday = cell.date === todayDate;
              const statusLabel = getCalendarStatusLabel({
                copy,
                day,
                isPast,
                isWeekend: cell.isWeekend,
              });
              const isUnavailable = !isAvailable && !isPast;
              const mobileStatusClass = getCalendarMobileStatusClass({
                day,
                isPast,
                isWeekend: cell.isWeekend,
                isSelected,
              });

              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelect(cell.date)}
                  className={`min-h-12 rounded-sm border p-1.5 text-sm transition sm:min-h-20 sm:p-2 ${mobileStatusClass} ${
                    isSelected
                      ? "border-accent bg-accent text-surface"
                      : isAvailable
                        ? cell.isWeekend
                          ? "border-line bg-surface-low/70 text-muted hover:border-accent hover:bg-surface-low hover:text-foreground"
                          : "border-line bg-background text-foreground hover:border-accent hover:bg-surface-low"
                        : isPast || isUnavailable
                          ? "border-transparent bg-transparent text-muted/30"
                          : "border-line/40 bg-background/60 text-muted/45"
                  } ${isToday && !isSelected ? "ring-1 ring-accent/70 ring-offset-2 ring-offset-surface" : ""}`}
                >
                  <span className="block font-semibold">{cell.dayNumber}</span>
                  {isToday ? (
                    <span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full sm:hidden ${isSelected ? "bg-surface" : "bg-accent"}`} />
                  ) : null}
                  {isToday ? (
                    <span className={`mt-1 hidden text-[10px] font-semibold sm:block ${isSelected ? "text-surface/80" : "text-accent"}`}>
                      {copy.todayLabel}
                    </span>
                  ) : null}
                  <span className={`mt-1 hidden text-[11px] sm:block ${isSelected ? "text-surface/75" : "text-muted"}`}>
                    {statusLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted sm:hidden">
            <CalendarLegendItem className="border-emerald-200 bg-emerald-50" label={copy.availableLabel} />
            <CalendarLegendItem className="border-stone-200 bg-stone-50" label={copy.pastLabel} />
            <CalendarLegendItem className="border-slate-200 bg-slate-50" label={copy.closedLabel} />
            <CalendarLegendItem className="border-amber-200 bg-amber-50" label={copy.fullyBookedLabel} />
          </div>

          {selectedDate ? (
            <p className="mt-5 rounded-sm border border-line/70 bg-background p-3 text-sm text-muted">
              {formatDate(selectedDate, locale)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function buildCalendarCells(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1, 12);
  const lastDay = new Date(year, month, 0, 12);
  const leadingEmptyCells = (firstDay.getDay() + 6) % 7;
  const cells: Array<{ date: string; dayNumber: number; isWeekend: boolean } | null> = Array.from(
    { length: leadingEmptyCells },
    () => null,
  );

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month - 1, day, 12);
    cells.push({
      date: formatLocalDate(date),
      dayNumber: day,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
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

function getCalendarStatusLabel({
  copy,
  day,
  isPast,
  isWeekend,
}: {
  copy: BookingFlowCopy;
  day: AvailableDay | undefined;
  isPast: boolean;
  isWeekend: boolean;
}) {
  if (day?.status === "available") {
    return copy.availableLabel;
  }

  if (isPast) {
    return copy.pastLabel;
  }

  if (day?.status === "closed" || (!day && isWeekend)) {
    return copy.closedLabel;
  }

  return copy.fullyBookedLabel;
}

function getCalendarMobileStatusClass({
  day,
  isPast,
  isWeekend,
  isSelected,
}: {
  day: AvailableDay | undefined;
  isPast: boolean;
  isWeekend: boolean;
  isSelected: boolean;
}) {
  if (isSelected) {
    return "";
  }

  if (day?.status === "available") {
    return "max-sm:border-emerald-200 max-sm:bg-emerald-50 max-sm:text-emerald-950";
  }

  if (isPast) {
    return "max-sm:border-stone-200 max-sm:bg-stone-50 max-sm:text-stone-400";
  }

  if (day?.status === "closed" || (!day && isWeekend)) {
    return "max-sm:border-slate-200 max-sm:bg-slate-50 max-sm:text-slate-400";
  }

  return "max-sm:border-amber-200 max-sm:bg-amber-50 max-sm:text-amber-950";
}

function CalendarLegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-[3px] border ${className}`} />
      {label}
    </span>
  );
}

function isBookableDay(day: AvailableDay) {
  return day.status === "available" && day.slots.length > 0;
}

function StepTime({
  copy,
  slots,
  selectedSlotStart,
  onSelect,
}: {
  copy: BookingFlowCopy;
  slots: AvailableSlot[];
  selectedSlotStart: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <StepHeading icon={<Clock size={20} />} title={copy.chooseTime} />
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            onClick={() => onSelect(slot.startAt)}
            className={`min-h-10 rounded-sm border px-2 text-xs font-semibold transition hover:-translate-y-0.5 sm:min-h-12 sm:px-4 sm:text-sm ${
              slot.startAt === selectedSlotStart
                ? "border-accent bg-accent text-surface"
                : "border-line/70 bg-surface hover:border-accent"
            }`}
          >
            {slot.localTime}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDetails({
  copy,
  patientName,
  patientEmail,
  patientPhone,
  patientNote,
  setPatientName,
  setPatientEmail,
  setPatientPhone,
  setPatientNote,
}: {
  copy: BookingFlowCopy;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNote: string;
  setPatientName: (value: string) => void;
  setPatientEmail: (value: string) => void;
  setPatientPhone: (value: string) => void;
  setPatientNote: (value: string) => void;
}) {
  return (
    <div>
      <StepHeading icon={<UserRound size={20} />} title={copy.patientDetails} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextInput label={copy.fullName} value={patientName} onChange={setPatientName} />
        <TextInput label={copy.email} value={patientEmail} onChange={setPatientEmail} type="email" />
        <TextInput label={copy.phone} value={patientPhone} onChange={setPatientPhone} />
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          {copy.note}
          <textarea
            value={patientNote}
            onChange={(event) => setPatientNote(event.target.value)}
            placeholder={copy.notePlaceholder}
            className="min-h-28 rounded-sm border border-line bg-background px-3 py-3 text-base outline-none transition focus:border-accent"
          />
        </label>
        <p className="rounded-sm border border-line/60 bg-background p-4 text-xs leading-5 text-muted md:col-span-2">
          {copy.privacyNote}
        </p>
      </div>
    </div>
  );
}

function StepConfirmation({
  copy,
  locale,
  appointmentType,
  slot,
  patientName,
  patientEmail,
  patientPhone,
  patientNote,
  confirmedAppointmentId,
  submitError,
  captchaToken,
  onCaptchaVerify,
  onCaptchaExpire,
}: {
  copy: BookingFlowCopy;
  locale: Locale;
  appointmentType: PublicAppointmentType | undefined;
  slot: AvailableSlot | undefined;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNote: string;
  confirmedAppointmentId: string;
  submitError: string;
  captchaToken: string;
  onCaptchaVerify: (token: string) => void;
  onCaptchaExpire: () => void;
}) {
  return (
    <div>
      <StepHeading icon={<Check size={20} />} title={copy.reviewTitle} />
      <dl className="mt-6 grid gap-3">
        <ReviewRow label={copy.treatment} value={appointmentType?.name ?? ""} />
        <ReviewRow label={copy.day} value={slot ? formatDate(slot.localDate, locale) : ""} />
        <ReviewRow label={copy.time} value={slot?.localTime ?? ""} />
        <ReviewRow label={copy.fullName} value={patientName} />
        <ReviewRow label={copy.email} value={patientEmail} />
        <ReviewRow label={copy.phone} value={patientPhone} />
        {patientNote ? <ReviewRow label={copy.note} value={patientNote} /> : null}
      </dl>
      {confirmedAppointmentId ? (
        <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {copy.bookingSuccess}
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {turnstileSiteKey ? (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              onVerify={onCaptchaVerify}
              onExpire={onCaptchaExpire}
            />
          ) : null}
          <p className="rounded-lg border border-line/70 bg-background p-4 text-sm text-muted">
            {copy.backendPending} {copy.confirmationReassurance}
            {turnstileSiteKey && !captchaToken ? ` ${copy.captchaError}` : ""}
          </p>
        </div>
      )}
      {submitError ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {submitError}
        </p>
      ) : null}
    </div>
  );
}

function StepHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent text-surface">
        {icon}
      </span>
      <h2 className="text-2xl font-medium">{title}</h2>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
      />
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-sm border border-line/70 bg-background p-4 sm:grid-cols-[180px_1fr]">
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
