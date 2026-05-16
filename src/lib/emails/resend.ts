import "server-only";

import { Resend } from "resend";

export function getEmailClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return null;
  }

  return {
    from,
    resend: new Resend(apiKey),
  };
}
