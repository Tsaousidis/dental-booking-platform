import Link from "next/link";

import { brand } from "@/config/brand";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-5 text-sm uppercase tracking-[0.24em] text-accent">
          {brand.clinicName}
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-7xl">
          {dictionary.home.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          {dictionary.home.heroSubtitle}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/booking`}
            className="inline-flex min-h-12 items-center justify-center bg-foreground px-6 text-sm font-medium text-background"
          >
            {dictionary.home.bookButton}
          </Link>
          <Link
            href={`/${locale === "el" ? "en" : "el"}`}
            className="inline-flex min-h-12 items-center justify-center border border-line px-6 text-sm font-medium"
          >
            {locale === "el" ? "EN" : "EL"}
          </Link>
        </div>
      </section>
    </div>
  );
}
