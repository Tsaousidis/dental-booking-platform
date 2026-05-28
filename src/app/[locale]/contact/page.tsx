import type { Metadata } from "next";

import { ContactContent } from "@/components/public/ContactContent";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";
import { getPublicClinicProfile } from "@/lib/public/clinic-profile";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({ locale, page: "contact", path: "/contact" });
}

export default async function ContactPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const [dictionary, clinicProfile] = await Promise.all([
    getDictionary(locale),
    getPublicClinicProfile(),
  ]);

  return (
    <PublicPageShell
      eyebrow={dictionary.contactPage.eyebrow}
      title={dictionary.contactPage.title}
      intro={dictionary.contactPage.intro}
    >
      <ContactContent dictionary={dictionary} locale={locale} clinicProfile={clinicProfile} />
    </PublicPageShell>
  );
}
