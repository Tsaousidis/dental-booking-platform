"use client";

import { CalendarDays, Check, Clock, UserRound } from "lucide-react";
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
            currentDate && days.some((day) => day.date === currentDate) ? currentDate : "",
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

    setConfirmedAppointmentId(payload.appointment.id);
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
              slot={selectedSlot}
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
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {appointmentTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className={`min-h-32 rounded-lg border p-5 text-left transition hover:-translate-y-0.5 ${
              type.id === selectedTypeId
                ? "border-accent bg-surface-low"
                : "border-line/70 bg-surface hover:border-accent"
            }`}
          >
            <span className="text-lg font-medium">{type.name}</span>
            <span className="mt-4 block text-sm text-muted">
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
  return (
    <div>
      <StepHeading icon={<CalendarDays size={20} />} title={copy.chooseDay} />
      {isLoading ? <p className="mt-6 text-sm text-muted">{copy.loading}</p> : null}
      {!isLoading && days.length === 0 ? (
        <p className="mt-6 rounded-lg border border-line/70 bg-background p-5 text-sm text-muted">
          {copy.noSlots}
        </p>
      ) : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            className={`min-h-24 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
              day.date === selectedDate
                ? "border-accent bg-surface-low"
                : "border-line/70 bg-surface hover:border-accent"
            }`}
          >
            <span className="block text-base font-medium">{formatDate(day.date, locale)}</span>
            <span className="mt-2 block text-sm text-muted">{day.slots.length} slots</span>
          </button>
        ))}
      </div>
    </div>
  );
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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            onClick={() => onSelect(slot.startAt)}
            className={`min-h-12 rounded-sm border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
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
            {copy.backendPending}
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
