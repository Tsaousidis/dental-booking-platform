import "server-only";

import { getEmailClient } from "./resend";

type GoogleCalendarConnectedInput = {
  doctorEmail: string;
  clinicName: string;
  adminEmail: string;
  googleAccountEmail: string | null;
};

export async function sendGoogleCalendarConnectedAlert({
  doctorEmail,
  clinicName,
  adminEmail,
  googleAccountEmail,
}: GoogleCalendarConnectedInput) {
  const client = getEmailClient();

  if (!client) {
    return { skipped: true };
  }

  const subject = `Σύνδεση Google Calendar - ${clinicName}`;
  const connectedAccount = googleAccountEmail ?? "Άγνωστος λογαριασμός";

  return client.resend.emails.send({
    from: client.from,
    to: doctorEmail,
    subject,
    html: `
      <div style="background:#fbfaf8;padding:32px;font-family:Arial,sans-serif;color:#171717;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e7e0d7;padding:32px;">
          <p style="margin:0 0 12px;color:#9d825f;text-transform:uppercase;letter-spacing:2px;font-size:12px;">Security alert</p>
          <h1 style="margin:0 0 20px;font-size:26px;line-height:1.2;">Συνδέθηκε Google Calendar</h1>
          <p style="margin:0 0 24px;color:#6f746f;font-size:16px;line-height:1.6;">
            Ένας admin σύνδεσε ή ανανέωσε τη σύνδεση Google Calendar για την κλινική.
          </p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px 0;color:#6f746f;font-size:14px;border-bottom:1px solid #e7e0d7;">Admin</td>
              <td style="padding:12px 0;color:#171717;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #e7e0d7;">${escapeHtml(adminEmail)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#6f746f;font-size:14px;border-bottom:1px solid #e7e0d7;">Google account</td>
              <td style="padding:12px 0;color:#171717;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #e7e0d7;">${escapeHtml(connectedAccount)}</td>
            </tr>
          </table>
        </div>
      </div>
    `,
    text: [
      "Συνδέθηκε Google Calendar",
      `Admin: ${adminEmail}`,
      `Google account: ${connectedAccount}`,
    ].join("\n"),
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
