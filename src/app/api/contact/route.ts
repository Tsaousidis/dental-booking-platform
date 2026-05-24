import { NextResponse } from "next/server";
import { z } from "zod";

import { brand } from "@/config/brand";
import { getEmailClient } from "@/lib/emails/resend";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

const contactSchema = z.object({
  locale: z.enum(["el", "en"]).default("el"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  message: z.string().trim().min(10).max(1500),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const result = contactSchema.safeParse(json);
  const fallbackIdentifier = result.success
    ? `contact:${result.data.email.toLowerCase()}`
    : "contact";
  const rateLimit = await checkRateLimit({
    route: "contact",
    identifier: getRequestIdentifier(request, fallbackIdentifier),
    limit: 3,
    windowSeconds: 60 * 10,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many contact requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  if (!result.success) {
    return NextResponse.json({ error: "Invalid contact details." }, { status: 400 });
  }

  const input = result.data;
  const client = getEmailClient();

  if (!client) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const isGreek = input.locale === "el";
  const subject = isGreek
    ? `Νέο μήνυμα επικοινωνίας - ${brand.clinicName}`
    : `New contact message - ${brand.clinicName}`;
  const recipient = process.env.CONTACT_TO_EMAIL || brand.email;

  const { error } = await client.resend.emails.send({
    from: client.from,
    to: recipient,
    replyTo: input.email,
    subject,
    html: contactEmailHtml({
      title: subject,
      name: input.name,
      email: input.email,
      message: input.message,
      isGreek,
    }),
    text: [
      `${isGreek ? "Όνομα" : "Name"}: ${input.name}`,
      `${isGreek ? "Email" : "Email"}: ${input.email}`,
      "",
      input.message,
    ].join("\n"),
  });

  if (error) {
    return NextResponse.json({ error: "Could not send contact message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function contactEmailHtml({
  title,
  name,
  email,
  message,
  isGreek,
}: {
  title: string;
  name: string;
  email: string;
  message: string;
  isGreek: boolean;
}) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#faf9f7; padding:32px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e3ddd6; padding:32px;">
        <p style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#9d825f; margin:0 0 16px;">${escapeHtml(title)}</p>
        <h1 style="font-size:24px; line-height:1.3; margin:0 0 24px; color:#171717;">${escapeHtml(isGreek ? "Μήνυμα από τη φόρμα επικοινωνίας" : "Message from the contact form")}</h1>
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:12px 0; border-top:1px solid #e3ddd6; color:#6b625b;">${escapeHtml(isGreek ? "Όνομα" : "Name")}</td>
            <td style="padding:12px 0; border-top:1px solid #e3ddd6; text-align:right; font-weight:600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-top:1px solid #e3ddd6; color:#6b625b;">Email</td>
            <td style="padding:12px 0; border-top:1px solid #e3ddd6; text-align:right; font-weight:600;">${escapeHtml(email)}</td>
          </tr>
        </table>
        <div style="margin-top:24px; padding-top:20px; border-top:1px solid #e3ddd6;">
          <p style="margin:0 0 8px; color:#6b625b;">${escapeHtml(isGreek ? "Μήνυμα" : "Message")}</p>
          <p style="white-space:pre-wrap; line-height:1.7; margin:0; color:#171717;">${escapeHtml(message)}</p>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
