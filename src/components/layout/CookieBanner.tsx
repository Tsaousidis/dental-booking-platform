"use client";

import { Settings2, X } from "lucide-react";
import { useState } from "react";

import { type Dictionary } from "@/lib/i18n";

type ConsentValue = "accepted" | "rejected";

export function CookieBanner({
  dictionary,
  hasStoredConsent,
}: {
  dictionary: Dictionary;
  hasStoredConsent: boolean;
}) {
  const [isVisible, setIsVisible] = useState(!hasStoredConsent);
  const [isManaging, setIsManaging] = useState(false);
  const copy = dictionary.cookieBanner;

  async function saveConsent(value: ConsentValue) {
    setIsVisible(false);

    try {
      await fetch("/api/cookie-consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
    } catch {
      setIsVisible(true);
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <section className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-line/60 bg-surface p-4 ambient-shadow-lg sm:inset-x-auto sm:right-5 sm:max-w-md sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-accent">Cookies</p>
          <h2 className="mt-2 text-xl font-medium">{copy.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-muted transition hover:border-accent hover:text-accent"
          aria-label={copy.reject}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">{copy.body}</p>

      {isManaging ? (
        <div className="mt-4 rounded-lg border border-line/60 bg-background p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{copy.essentialTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{copy.essentialBody}</p>
            </div>
            <span className="shrink-0 rounded-sm border border-accent px-2 py-1 text-xs font-semibold text-accent">
              On
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className="min-h-11 rounded-sm bg-accent px-4 text-sm font-semibold text-surface transition hover:bg-foreground sm:col-span-1"
        >
          {copy.accept}
        </button>
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="min-h-11 rounded-sm border border-line px-4 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          {copy.reject}
        </button>
        <button
          type="button"
          onClick={() => (isManaging ? saveConsent("accepted") : setIsManaging(true))}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-line px-4 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          <Settings2 size={15} aria-hidden="true" />
          {isManaging ? copy.save : copy.manage}
        </button>
      </div>
    </section>
  );
}
