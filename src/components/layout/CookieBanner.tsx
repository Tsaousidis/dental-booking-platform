"use client";

import { Settings2, X } from "lucide-react";
import { useState } from "react";

import { type Dictionary } from "@/lib/i18n";

const STORAGE_KEY = "dental_cookie_consent";

export function CookieBanner({ dictionary }: { dictionary: Dictionary }) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !localStorage.getItem(STORAGE_KEY);
  });
  const [isManaging, setIsManaging] = useState(false);
  const copy = dictionary.cookieBanner;

  function saveConsent(value: "accepted" | "rejected") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        value,
        savedAt: new Date().toISOString(),
      }),
    );
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <section className="fixed inset-x-3 bottom-3 z-50 border border-line bg-surface p-4 shadow-[0_18px_50px_rgba(23,23,23,0.16)] sm:inset-x-auto sm:right-5 sm:max-w-md sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-accent">Cookies</p>
          <h2 className="mt-2 text-xl font-semibold">{copy.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="flex h-9 w-9 items-center justify-center border border-line text-muted transition hover:border-foreground hover:text-foreground"
          aria-label={copy.reject}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">{copy.body}</p>

      {isManaging ? (
        <div className="mt-4 border border-line bg-background p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{copy.essentialTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{copy.essentialBody}</p>
            </div>
            <span className="shrink-0 border border-accent px-2 py-1 text-xs font-semibold text-accent">
              On
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className="min-h-11 bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent sm:col-span-1"
        >
          {copy.accept}
        </button>
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="min-h-11 border border-line px-4 text-sm font-semibold transition hover:border-foreground"
        >
          {copy.reject}
        </button>
        <button
          type="button"
          onClick={() => (isManaging ? saveConsent("accepted") : setIsManaging(true))}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-line px-4 text-sm font-semibold transition hover:border-foreground"
        >
          <Settings2 size={15} aria-hidden="true" />
          {isManaging ? copy.save : copy.manage}
        </button>
      </div>
    </section>
  );
}
