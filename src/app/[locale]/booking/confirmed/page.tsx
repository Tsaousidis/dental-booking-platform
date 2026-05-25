import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CalendarClock, Mail, MapPin, RefreshCw, XCircle } from "lucide-react";

import { type Locale } from "@/config/locales";
import { getConfirmedAppointmentDetails } from "@/lib/booking/confirmation-data";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const copyByLocale = {
  el: {
    eyebrow: "Επιβεβαίωση ραντεβού",
    title: "Το ραντεβού σας επιβεβαιώθηκε.",
    intro:
      "Σας στείλαμε email επιβεβαίωσης με όλες τις λεπτομέρειες. Κρατήστε αυτή τη σελίδα αν θέλετε να αλλάξετε ή να ακυρώσετε το ραντεβού σας.",
    notFoundTitle: "Δεν βρέθηκε επιβεβαιωμένο ραντεβού.",
    notFoundBody:
      "Ο σύνδεσμος μπορεί να έχει λήξει ή να μην είναι σωστός. Αν χρειάζεστε βοήθεια, επικοινωνήστε με την κλινική.",
    summary: "Σύνοψη",
    treatment: "Θεραπεία",
    dateTime: "Ημερομηνία / ώρα",
    patient: "Ασθενής",
    email: "Email",
    phone: "Τηλέφωνο",
    clinic: "Κλινική",
    whatNext: "Τι να περιμένετε",
    whatNextItems: [
      "Θα λάβετε email επιβεβαίωσης αμέσως μετά την κράτηση.",
      "Αν χρειαστεί αλλαγή, χρησιμοποιήστε τον σύνδεσμο αλλαγής ώρας πριν από το ραντεβού.",
      "Αν δεν μπορείτε να προσέλθετε, ακυρώστε εγκαίρως ώστε να ελευθερωθεί η ώρα.",
      "Φτάστε λίγα λεπτά νωρίτερα για ήρεμη υποδοχή και σύντομη επιβεβαίωση στοιχείων.",
    ],
    reschedule: "Αλλαγή ώρας",
    cancel: "Ακύρωση ραντεβού",
    bookAnother: "Νέο ραντεβού",
  },
  en: {
    eyebrow: "Appointment confirmation",
    title: "Your appointment is confirmed.",
    intro:
      "We sent you a confirmation email with all details. Keep this page if you need to reschedule or cancel your appointment.",
    notFoundTitle: "No confirmed appointment was found.",
    notFoundBody:
      "This link may have expired or may be incorrect. If you need help, please contact the clinic.",
    summary: "Summary",
    treatment: "Treatment",
    dateTime: "Date / time",
    patient: "Patient",
    email: "Email",
    phone: "Phone",
    clinic: "Clinic",
    whatNext: "What to expect",
    whatNextItems: [
      "You will receive a confirmation email immediately after booking.",
      "If you need to change the time, use the reschedule link before the appointment.",
      "If you cannot attend, cancel early so the time can become available again.",
      "Arrive a few minutes early for a calm welcome and quick details check.",
    ],
    reschedule: "Reschedule",
    cancel: "Cancel appointment",
    bookAnother: "Book another appointment",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    page: "booking",
    path: "/booking/confirmed",
    noIndex: true,
  });
}

export default async function ConfirmedBookingPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string }>;
}>) {
  const { locale } = await params;
  const { token = "" } = await searchParams;
  const copy = copyByLocale[locale];
  const appointment = token
    ? await getConfirmedAppointmentDetails({ token, locale })
    : null;

  if (!appointment) {
    return (
      <main className="bg-background">
        <section className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-16 sm:px-8">
          <div className="rounded-lg border border-line/50 bg-surface p-8 text-center ambient-shadow">
            <p className="label-caps text-accent">{copy.eyebrow as string}</p>
            <h1 className="mt-4 text-3xl font-light">{copy.notFoundTitle as string}</h1>
            <p className="mt-4 text-sm leading-6 text-muted">{copy.notFoundBody as string}</p>
            <Link
              href={`/${locale}/booking`}
              className="mt-8 inline-flex min-h-12 items-center rounded-sm bg-accent px-6 text-sm font-semibold text-surface transition hover:bg-foreground"
            >
              {copy.bookAnother as string}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-background">
      <section className="border-b border-line/30 bg-surface">
        <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CalendarCheck size={22} aria-hidden="true" />
            </span>
            <p className="label-caps text-accent">{copy.eyebrow as string}</p>
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-light leading-tight sm:text-5xl">
            {copy.title as string}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{copy.intro as string}</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
          <h2 className="text-2xl font-medium">{copy.summary as string}</h2>
          <dl className="mt-6 grid gap-3">
            <SummaryRow label={copy.treatment as string} value={appointment.appointmentTypeName} />
            <SummaryRow label={copy.dateTime as string} value={appointment.appointmentTime} />
            <SummaryRow label={copy.patient as string} value={appointment.patientName} />
            <SummaryRow label={copy.email as string} value={appointment.patientEmail} />
            <SummaryRow label={copy.phone as string} value={appointment.patientPhone} />
            <SummaryRow label={copy.clinic as string} value={appointment.clinicName} />
          </dl>
          {appointment.clinicAddress || appointment.clinicPhone || appointment.clinicEmail ? (
            <div className="mt-6 rounded-sm border border-line/60 bg-background p-4 text-sm text-muted">
              {appointment.clinicAddress ? (
                <p className="flex gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  {appointment.clinicAddress}
                </p>
              ) : null}
              {appointment.clinicEmail ? (
                <p className="mt-2 flex gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  {appointment.clinicEmail}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="grid gap-4 self-start">
          <Link
            href={appointment.rescheduleUrl}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-accent px-5 text-sm font-semibold text-surface transition hover:bg-foreground"
          >
            <RefreshCw size={16} aria-hidden="true" />
            {copy.reschedule as string}
          </Link>
          <Link
            href={appointment.cancelUrl}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-line bg-surface px-5 text-sm font-semibold transition hover:border-red-300 hover:text-red-700"
          >
            <XCircle size={16} aria-hidden="true" />
            {copy.cancel as string}
          </Link>
          <Link
            href={`/${locale}/booking`}
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-line bg-surface px-5 text-sm font-semibold transition hover:border-accent hover:text-accent"
          >
            {copy.bookAnother as string}
          </Link>
        </aside>

        <div className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow lg:col-span-2">
          <div className="flex items-center gap-3">
            <CalendarClock size={20} className="text-accent" aria-hidden="true" />
            <h2 className="text-2xl font-medium">{copy.whatNext as string}</h2>
          </div>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted md:grid-cols-2">
            {(copy.whatNextItems as string[]).map((item) => (
              <li key={item} className="rounded-sm border border-line/60 bg-background p-4">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-sm border border-line/70 bg-background p-4 sm:grid-cols-[170px_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}

