import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

const serviceKeys = ["implants", "whitening", "veneers", "invisalign", "cleaning"] as const;

export function ServicesContent({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {serviceKeys.map((service, index) => (
        <article
          key={service}
          className={`group flex min-h-72 flex-col justify-between rounded-lg border border-line/50 bg-surface p-6 ambient-shadow transition hover:-translate-y-1 hover:border-champagne sm:p-8 ${
            index === 0 ? "md:col-span-2" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Sparkles className="text-champagne transition group-hover:text-accent" size={24} aria-hidden="true" />
                <p className="label-caps text-accent">
                {String(index + 1).padStart(2, "0")}
                </p>
              </div>
              <h2 className="text-2xl font-medium sm:text-3xl">
                {dictionary.servicesPage.items[service].title}
              </h2>
            </div>
            <Link
              href={`/${locale}/booking`}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-line transition hover:border-accent hover:bg-surface-low sm:flex"
              aria-label={dictionary.servicesPage.book}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
            {dictionary.servicesPage.items[service].body}
          </p>
          <Link
            href={`/${locale}/booking`}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-5 text-sm font-medium text-surface transition hover:bg-foreground sm:hidden"
          >
            {dictionary.servicesPage.book}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
