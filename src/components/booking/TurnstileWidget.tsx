"use client";

import Script from "next/script";
import { useEffect, useId, useRef } from "react";

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

  useEffect(() => {
    renderWidget();
  });

  function renderWidget() {
    if (!siteKey || !window.turnstile || widgetIdRef.current) {
      return;
    }

    const container = document.getElementById(elementId);

    if (!container) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: siteKey,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onExpire,
    });
  }

  return (
    <div className="grid gap-3">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div id={elementId} />
    </div>
  );
}
