import type { Metadata } from "next";

import { brand } from "@/config/brand";
import { locales, type Locale } from "@/config/locales";
import { site } from "@/config/site";

type SeoPage =
  | "home"
  | "about"
  | "services"
  | "booking"
  | "contact"
  | "privacy"
  | "cookies"
  | "cancel"
  | "reschedule";

const seoCopy: Record<Locale, Record<SeoPage, { title: string; description: string }>> = {
  el: {
    home: {
      title: `${brand.clinicName} | Premium οδοντιατρική στην Αθήνα`,
      description:
        "Premium οδοντιατρική φροντίδα στην Αθήνα με online κράτηση ραντεβού.",
    },
    about: {
      title: `Γιατρός | ${brand.clinicName}`,
      description:
        "Γνωρίστε τη φιλοσοφία και το προφίλ του γιατρού του Athenian Dental Studio.",
    },
    services: {
      title: `Οδοντιατρικές υπηρεσίες | ${brand.clinicName}`,
      description:
        "Εμφυτεύματα, λεύκανση, όψεις, Invisalign και σύγχρονες οδοντιατρικές θεραπείες στην Αθήνα.",
    },
    booking: {
      title: `Κλείστε ραντεβού | ${brand.clinicName}`,
      description: "Επιλέξτε θεραπεία, ημέρα και ώρα για το οδοντιατρικό σας ραντεβού.",
    },
    contact: {
      title: `Επικοινωνία | ${brand.clinicName}`,
      description: `Επικοινωνήστε με το ${brand.clinicName} στο ${brand.city}.`,
    },
    privacy: {
      title: `Πολιτική απορρήτου | ${brand.clinicName}`,
      description: "Placeholder πολιτική απορρήτου για το dental booking website.",
    },
    cookies: {
      title: `Πολιτική cookies | ${brand.clinicName}`,
      description: "Placeholder πολιτική cookies για το dental booking website.",
    },
    cancel: {
      title: `Ακύρωση ραντεβού | ${brand.clinicName}`,
      description: "Ασφαλής ακύρωση οδοντιατρικού ραντεβού.",
    },
    reschedule: {
      title: `Αλλαγή ραντεβού | ${brand.clinicName}`,
      description: "Ασφαλής αλλαγή ώρας οδοντιατρικού ραντεβού.",
    },
  },
  en: {
    home: {
      title: `${brand.clinicName} | Premium dental care in Athens`,
      description: "Premium dental care in Athens with online appointment booking.",
    },
    about: {
      title: `Doctor | ${brand.clinicName}`,
      description: "Meet the doctor profile and care philosophy of Athenian Dental Studio.",
    },
    services: {
      title: `Dental services | ${brand.clinicName}`,
      description:
        "Implants, whitening, veneers, Invisalign, and modern dental treatments in Athens.",
    },
    booking: {
      title: `Book appointment | ${brand.clinicName}`,
      description: "Choose a treatment, day, and time for your dental appointment.",
    },
    contact: {
      title: `Contact | ${brand.clinicName}`,
      description: `Contact ${brand.clinicName} in ${brand.city}.`,
    },
    privacy: {
      title: `Privacy policy | ${brand.clinicName}`,
      description: "Placeholder privacy policy for the dental booking website.",
    },
    cookies: {
      title: `Cookie policy | ${brand.clinicName}`,
      description: "Placeholder cookie policy for the dental booking website.",
    },
    cancel: {
      title: `Cancel appointment | ${brand.clinicName}`,
      description: "Secure dental appointment cancellation.",
    },
    reschedule: {
      title: `Reschedule appointment | ${brand.clinicName}`,
      description: "Secure dental appointment rescheduling.",
    },
  },
};

export const publicSeoPaths = ["", "/about", "/services", "/booking", "/contact", "/privacy", "/cookies"];

export function createPageMetadata({
  locale,
  page,
  path = "",
  noIndex = false,
}: {
  locale: Locale;
  page: SeoPage;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const copy = seoCopy[locale][page];
  const canonicalPath = localizedPath(locale, path);

  return {
    metadataBase: new URL(site.url),
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries([
        ...locales.map((availableLocale) => [
          availableLocale,
          localizedPath(availableLocale, path),
        ]),
        ["x-default", localizedPath("el", path)],
      ]),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonicalPath,
      siteName: brand.clinicName,
      locale: locale === "el" ? "el_GR" : "en_US",
      type: "website",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export function localizedPath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

export function absoluteUrl(path = "") {
  return new URL(path, site.url).toString();
}
