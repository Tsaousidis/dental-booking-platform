import type { Metadata } from "next";

import { HomePageSections } from "@/components/public/HomePageSections";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({ locale, page: "home" });
}

export default async function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return <HomePageSections locale={locale} dictionary={dictionary} />;
}
