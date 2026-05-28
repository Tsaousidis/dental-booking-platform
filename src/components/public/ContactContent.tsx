"use client";

import { ArrowRight, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

export function ContactContent({
  dictionary,
  locale,
  clinicProfile,
}: {
  dictionary: Dictionary;
  locale: Locale;
  clinicProfile: {
    address: string;
    phone: string;
    email: string;
  };
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const copy = dictionary.contactPage;
  const address = clinicProfile.address;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const formData = new FormData(event.currentTarget);
    const payload = {
      locale,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response?.ok) {
      setStatus("error");
      return;
    }

    event.currentTarget.reset();
    setStatus("success");
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <InfoRow icon={MapPin} label={copy.addressLabel} value={address} />
          <InfoRow icon={Phone} label={copy.phoneLabel} value={clinicProfile.phone} />
          <InfoRow icon={Mail} label={copy.emailLabel} value={clinicProfile.email} />
          <div className="overflow-hidden rounded-lg border border-line/50 bg-surface ambient-shadow">
            <iframe
              title={copy.mapTitle}
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
            <div className="flex items-start gap-4">
              <Clock className="mt-1 text-accent" size={22} aria-hidden="true" />
              <div className="w-full">
                <h2 className="text-xl font-medium">{copy.hoursTitle}</h2>
                <dl className="mt-5 grid gap-3 text-sm">
                  {[
                    [copy.weekdays, copy.weekdayHours],
                    [copy.saturday, copy.saturdayHours],
                    [copy.sunday, copy.sundayHours],
                  ].map(([day, hours]) => (
                    <div key={day} className="flex justify-between gap-6 border-t border-line/60 pt-3">
                      <dt className="text-muted">{day}</dt>
                      <dd className="text-right font-medium">{hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow sm:p-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-medium">{copy.formTitle}</h2>
            <p className="mt-3 text-base leading-7 text-muted">{copy.formBody}</p>
          </div>

          <div className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              {copy.nameLabel}
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                placeholder={copy.namePlaceholder}
                className="min-h-12 rounded-sm border border-line bg-background px-4 outline-none transition focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {copy.emailInputLabel}
              <input
                name="email"
                type="email"
                required
                maxLength={180}
                placeholder={copy.emailPlaceholder}
                className="min-h-12 rounded-sm border border-line bg-background px-4 outline-none transition focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {copy.messageLabel}
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={1500}
                rows={5}
                placeholder={copy.messagePlaceholder}
                className="rounded-sm border border-line bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-muted">{copy.responseNote}</p>
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-accent px-6 text-sm font-semibold text-surface transition hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} aria-hidden="true" />
              {status === "sending" ? copy.sending : copy.submit}
            </button>
          </div>

          {status === "success" ? (
            <p className="mt-5 rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {copy.success}
            </p>
          ) : null}
          {status === "error" ? (
            <p className="mt-5 rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {copy.error}
            </p>
          ) : null}
        </form>
      </div>

      <div className="flex min-h-[420px] items-end rounded-lg border border-line/50 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(250,249,247,0.42)),url('https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center ambient-shadow">
        <div className="m-5 max-w-md rounded-lg bg-surface/90 p-6 backdrop-blur">
          <h2 className="text-2xl font-medium">{copy.mapTitle}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{copy.mapBody}</p>
        </div>
      </div>

      <section className="rounded-lg bg-accent p-8 text-surface sm:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="max-w-2xl text-3xl font-light leading-tight">{copy.ctaTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-surface/75">{copy.ctaBody}</p>
          </div>
          <Link
            href={`/${locale}/booking`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-champagne px-6 text-sm font-semibold text-foreground transition hover:scale-[1.03] hover:bg-surface"
          >
            {copy.ctaButton}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
      <Icon className="mt-1 shrink-0 text-accent" size={22} aria-hidden="true" />
      <div>
        <p className="label-caps text-muted">{label}</p>
        <p className="mt-1 text-lg font-medium">{value}</p>
      </div>
    </div>
  );
}
