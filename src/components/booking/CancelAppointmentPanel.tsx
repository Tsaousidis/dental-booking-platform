"use client";

import { useState } from "react";

import { type Locale } from "@/config/locales";
import { type CancelAppointmentDetails } from "@/lib/booking/cancel-data";

const copy = {
  el: {
    title: "Ακύρωση ραντεβού",
    intro: "Ελέγξτε τα στοιχεία και επιβεβαιώστε την ακύρωση.",
    notFound: "Δεν βρέθηκε ραντεβού για αυτό το link.",
    alreadyCancelled: "Το ραντεβού είναι ήδη ακυρωμένο.",
    patient: "Ασθενής",
    email: "Email",
    treatment: "Θεραπεία",
    time: "Ημερομηνία / ώρα",
    status: "Status",
    cancel: "Ακύρωση ραντεβού",
    cancelling: "Γίνεται ακύρωση...",
    success: "Το ραντεβού ακυρώθηκε.",
    error: "Δεν ήταν δυνατή η ακύρωση. Δοκιμάστε ξανά.",
  },
  en: {
    title: "Cancel appointment",
    intro: "Review the details and confirm the cancellation.",
    notFound: "No appointment was found for this link.",
    alreadyCancelled: "This appointment is already cancelled.",
    patient: "Patient",
    email: "Email",
    treatment: "Treatment",
    time: "Date / time",
    status: "Status",
    cancel: "Cancel appointment",
    cancelling: "Cancelling...",
    success: "The appointment has been cancelled.",
    error: "Could not cancel the appointment. Please try again.",
  },
};

export function CancelAppointmentPanel({
  locale,
  token,
  appointment,
}: {
  locale: Locale;
  token: string;
  appointment: CancelAppointmentDetails | null;
}) {
  const t = copy[locale];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function cancelAppointment() {
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/booking/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, locale }),
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
      <CancelShell title={t.title} intro={t.intro}>
        <p className="border border-line bg-background p-5 text-sm text-muted">
          {t.notFound}
        </p>
      </CancelShell>
    );
  }

  const isCancelled = appointment.status === "cancelled" || Boolean(message);

  return (
    <CancelShell title={t.title} intro={t.intro}>
      <dl className="grid gap-3">
        <ReviewRow label={t.patient} value={appointment.patientName} />
        <ReviewRow label={t.email} value={appointment.patientEmail} />
        <ReviewRow label={t.treatment} value={appointment.appointmentTypeName} />
        <ReviewRow label={t.time} value={appointment.appointmentTime} />
      </dl>

      {isCancelled ? (
        <p className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {message || t.alreadyCancelled}
        </p>
      ) : (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={cancelAppointment}
          className="mt-6 min-h-12 bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t.cancelling : t.cancel}
        </button>
      )}

      {error ? (
        <p className="mt-4 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </CancelShell>
  );
}

function CancelShell({
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
      <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
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
