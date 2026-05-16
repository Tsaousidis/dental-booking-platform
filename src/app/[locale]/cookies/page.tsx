import type { Metadata } from "next";

import { LegalContent } from "@/components/public/LegalContent";
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

  return createPageMetadata({ locale, page: "cookies", path: "/cookies" });
}

export default async function CookiesPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PublicPageShell
      eyebrow={dictionary.legalPages.eyebrow}
      title={dictionary.legalPages.cookiesTitle}
    >
      <LegalContent
        body={dictionary.legalPages.cookiesBody}
        notice={dictionary.legalPages.notice}
      />
    </PublicPageShell>
  );
}
