import { ArrowRight } from "lucide-react";
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
    <div className="grid gap-4 md:grid-cols-2">
      {serviceKeys.map((service, index) => (
        <article
          key={service}
          className={`border border-line bg-surface p-6 transition hover:border-accent sm:p-8 ${
            index === 0 ? "md:col-span-2" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
                {dictionary.servicesPage.items[service].title}
              </h2>
            </div>
            <Link
              href={`/${locale}/booking`}
              className="hidden h-11 w-11 shrink-0 items-center justify-center border border-line transition hover:border-accent sm:flex"
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
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent sm:hidden"
          >
            {dictionary.servicesPage.book}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
