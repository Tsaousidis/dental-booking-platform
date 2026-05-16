"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
    };
    onDentalBookingTurnstileLoad?: () => void;
  }
}

export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const elementId = useId().replaceAll(":", "");
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    window.onDentalBookingTurnstileLoad = renderWidget;
    renderWidget();

    const timeout = window.setTimeout(() => {
      if (!widgetIdRef.current) {
        setStatus("error");
      }
    }, 6000);

    return () => {
      window.clearTimeout(timeout);

      if (window.onDentalBookingTurnstileLoad === renderWidget) {
        delete window.onDentalBookingTurnstileLoad;
      }
    };
  });

  function renderWidget() {
    if (!siteKey || !window.turnstile || widgetIdRef.current) {
      return;
    }

    const container = document.getElementById(elementId);

    if (!container) {
      return;
    }

    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      callback: (token) => {
        setStatus("ready");
        onVerify(token);
      },
      "expired-callback": () => {
        setStatus("loading");
        onExpire();
      },
      "error-callback": () => {
        setStatus("error");
        onExpire();
      },
    });

    if (widgetId) {
      widgetIdRef.current = widgetId;
      setStatus("ready");
    }
  }

  return (
    <div className="grid gap-3">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onDentalBookingTurnstileLoad"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div id={elementId} className="min-h-[65px]" />
      {status === "loading" ? (
        <p className="text-sm text-muted">Φόρτωση ελέγχου ασφαλείας...</p>
      ) : null}
      {status === "error" ? (
        <p className="border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          Δεν φορτώθηκε το Turnstile. Ελέγξτε ότι το site key επιτρέπει το
          localhost ή χρησιμοποιήστε τα Cloudflare test keys.
        </p>
      ) : null}
    </div>
  );
}
