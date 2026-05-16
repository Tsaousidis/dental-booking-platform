import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { type Locale } from "@/config/locales";

import { getEmailClient } from "./resend";

type BookingEmailInput = {
  locale: Locale;
  clinicName: string;
  doctorEmail: string;
  appointmentTypeName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNote?: string | null;
  startAt: string;
  endAt: string;
};

export async function sendPatientBookingConfirmation(input: BookingEmailInput) {
  const client = getEmailClient();

  if (!client) {
    return { skipped: true };
  }

  const isGreek = input.locale === "el";
  const subject = isGreek
    ? `Επιβεβαίωση ραντεβού - ${input.clinicName}`
    : `Appointment confirmation - ${input.clinicName}`;
  const appointmentTime = formatAppointmentTime(input.startAt, input.endAt);
  const greeting = isGreek ? `Γεια σας ${input.patientName},` : `Hello ${input.patientName},`;
  const body = isGreek
    ? `Το ραντεβού σας επιβεβαιώθηκε.`
    : `Your appointment has been confirmed.`;

  return client.resend.emails.send({
    from: client.from,
    to: input.patientEmail,
    subject,
    html: emailHtml({
      title: subject,
      greeting,
      body,
      rows: [
        [isGreek ? "Θεραπεία" : "Treatment", input.appointmentTypeName],
        [isGreek ? "Ημερομηνία / ώρα" : "Date / time", appointmentTime],
        [isGreek ? "Κλινική" : "Clinic", input.clinicName],
      ],
    }),
    text: [
      greeting,
      body,
      `${isGreek ? "Θεραπεία" : "Treatment"}: ${input.appointmentTypeName}`,
      `${isGreek ? "Ημερομηνία / ώρα" : "Date / time"}: ${appointmentTime}`,
      `${isGreek ? "Κλινική" : "Clinic"}: ${input.clinicName}`,
    ].join("\n"),
  });
}

export async function sendDoctorNewBookingNotification(input: BookingEmailInput) {
  const client = getEmailClient();

  if (!client) {
    return { skipped: true };
  }

  const appointmentTime = formatAppointmentTime(input.startAt, input.endAt);
  const subject = `Νέο ραντεβού - ${input.patientName}`;

  return client.resend.emails.send({
    from: client.from,
    to: input.doctorEmail,
    subject,
    html: emailHtml({
      title: subject,
      greeting: "Νέο online booking",
      body: "Ένας ασθενής έκλεισε νέο ραντεβού.",
      rows: [
        ["Ασθενής", input.patientName],
        ["Email", input.patientEmail],
        ["Τηλέφωνο", input.patientPhone],
        ["Θεραπεία", input.appointmentTypeName],
        ["Ημερομηνία / ώρα", appointmentTime],
        ["Σημείωση", input.patientNote || "-"],
      ],
    }),
    text: [
      "Νέο online booking",
      `Ασθενής: ${input.patientName}`,
      `Email: ${input.patientEmail}`,
      `Τηλέφωνο: ${input.patientPhone}`,
      `Θεραπεία: ${input.appointmentTypeName}`,
      `Ημερομηνία / ώρα: ${appointmentTime}`,
      `Σημείωση: ${input.patientNote || "-"}`,
    ].join("\n"),
  });
}

function formatAppointmentTime(startAt: string, endAt: string) {
  const date = formatInTimeZone(startAt, "Europe/Athens", "dd/MM/yyyy");
  const start = formatInTimeZone(startAt, "Europe/Athens", "HH:mm");
  const end = formatInTimeZone(endAt, "Europe/Athens", "HH:mm");

  return `${date}, ${start}-${end}`;
}

function emailHtml({
  title,
  greeting,
  body,
  rows,
}: {
  title: string;
  greeting: string;
  body: string;
  rows: Array<[string, string]>;
}) {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 0;color:#6f746f;font-size:14px;border-bottom:1px solid #e7e0d7;">${escapeHtml(label)}</td>
          <td style="padding:12px 0;color:#171717;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #e7e0d7;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="background:#fbfaf8;padding:32px;font-family:Arial,sans-serif;color:#171717;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e7e0d7;padding:32px;">
        <p style="margin:0 0 12px;color:#9d825f;text-transform:uppercase;letter-spacing:2px;font-size:12px;">${escapeHtml(title)}</p>
        <h1 style="margin:0 0 20px;font-size:28px;line-height:1.2;">${escapeHtml(greeting)}</h1>
        <p style="margin:0 0 24px;color:#6f746f;font-size:16px;line-height:1.6;">${escapeHtml(body)}</p>
        <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
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
