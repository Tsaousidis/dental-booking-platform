import { notFound } from "next/navigation";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { StickyMobileBookingCTA } from "@/components/layout/StickyMobileBookingCTA";
import { StructuredData } from "@/components/public/StructuredData";
import { isLocale, locales, type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const activeLocale = locale satisfies Locale;
  const dictionary = await getDictionary(activeLocale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader locale={activeLocale} dictionary={dictionary} />
      <main data-locale={activeLocale}>{children}</main>
      <StructuredData />
      <PublicFooter locale={activeLocale} dictionary={dictionary} />
      <StickyMobileBookingCTA locale={activeLocale} dictionary={dictionary} />
    </div>
  );
}
