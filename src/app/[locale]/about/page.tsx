import type { Metadata } from "next";

import { AboutContent } from "@/components/public/AboutContent";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({ locale, page: "about", path: "/about" });
}

export default async function AboutPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PublicPageShell
      eyebrow={dictionary.aboutPage.eyebrow}
      title={dictionary.aboutPage.title}
      intro={dictionary.aboutPage.intro}
    >
      <AboutContent dictionary={dictionary} />
    </PublicPageShell>
  );
}
