import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public/PublicPageShell";
import { ServicesContent } from "@/components/public/ServicesContent";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({ locale, page: "services", path: "/services" });
}

export default async function ServicesPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PublicPageShell
      eyebrow={dictionary.servicesPage.eyebrow}
      title={dictionary.servicesPage.title}
      intro={dictionary.servicesPage.intro}
    >
      <ServicesContent locale={locale} dictionary={dictionary} />
    </PublicPageShell>
  );
}
