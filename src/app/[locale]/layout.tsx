import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { CookieBanner } from "@/components/layout/CookieBanner";
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
  const cookieStore = await cookies();
  const hasStoredCookieConsent = Boolean(cookieStore.get("dental_cookie_consent"));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader locale={activeLocale} dictionary={dictionary} />
      <main data-locale={activeLocale}>{children}</main>
      <StructuredData />
      <PublicFooter locale={activeLocale} dictionary={dictionary} />
      <StickyMobileBookingCTA locale={activeLocale} dictionary={dictionary} />
      <CookieBanner dictionary={dictionary} hasStoredConsent={hasStoredCookieConsent} />
    </div>
  );
}
