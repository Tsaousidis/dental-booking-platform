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
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        {serviceKeys.map((service, index) => {
          const item = dictionary.servicesPage.items[service];

          return (
            <article
              key={service}
              className="group flex min-h-96 flex-col justify-between rounded-lg border border-line/50 bg-surface p-6 ambient-shadow transition hover:-translate-y-1 hover:border-champagne sm:p-8"
            >
              <div>
                <div className="mb-7 flex items-center gap-3">
                  <Sparkles className="text-champagne transition group-hover:text-accent" size={24} aria-hidden="true" />
                  <p className="label-caps text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
                <h2 className="text-2xl font-medium sm:text-3xl">
                  {item.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-muted">
                  {item.body}
                </p>
                <dl className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    [dictionary.servicesPage.durationLabel, item.duration],
                    [dictionary.servicesPage.visitsLabel, item.visits],
                    [dictionary.servicesPage.comfortLabel, item.comfort],
                    [dictionary.servicesPage.suitableLabel, item.suitable],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-sm border border-line/60 bg-background p-3">
                      <dt className="label-caps text-accent">{label}</dt>
                      <dd className="mt-2 leading-6 text-muted">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Link
                href={`/${locale}/booking`}
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-5 text-sm font-medium text-surface transition hover:bg-foreground"
              >
                {dictionary.servicesPage.book}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>

      <section className="rounded-lg bg-accent p-8 text-surface sm:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="max-w-2xl text-3xl font-light leading-tight">
              {dictionary.servicesPage.ctaTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-surface/75">
              {dictionary.servicesPage.ctaBody}
            </p>
          </div>
          <Link
            href={`/${locale}/booking`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-champagne px-6 text-sm font-semibold text-foreground transition hover:scale-[1.03] hover:bg-surface"
          >
            {dictionary.servicesPage.ctaButton}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
