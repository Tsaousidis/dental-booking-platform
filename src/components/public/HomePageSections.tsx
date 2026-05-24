import { ArrowRight, Award, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";

import { brand } from "@/config/brand";
import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

const serviceKeys = ["implants", "whitening", "veneers", "invisalign", "cleaning"] as const;
const reviewKeys = ["first", "second", "third"] as const;

export function HomePageSections({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <>
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden border-b border-line/30">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${brand.doctorImageUrl}")` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,249,247,0.95),rgba(250,249,247,0.64),rgba(250,249,247,0.16))]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl items-center px-5 py-16 sm:px-8">
          <div className="max-w-2xl">
            <p className="label-caps mb-5 text-accent">{dictionary.home.heroEyebrow}</p>
            <h1 className="max-w-4xl text-5xl font-light leading-[1.04] text-foreground sm:text-7xl">
              {dictionary.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              {dictionary.home.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/booking`}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-sm bg-accent px-8 text-sm font-semibold text-surface shadow-lg transition hover:scale-[1.02]"
              >
                {dictionary.home.bookButton}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                href={`/${locale}/services`}
                className="inline-flex min-h-14 items-center justify-center rounded-sm border border-line bg-surface/70 px-8 text-sm font-semibold text-accent backdrop-blur transition hover:border-accent hover:bg-surface"
              >
                {dictionary.home.secondaryButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
        <div
          className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container bg-cover bg-center ambient-shadow"
          style={{ backgroundImage: `url("${brand.doctorImageUrl}")` }}
        />
        <div className="flex flex-col justify-center">
          <p className="label-caps text-accent">{dictionary.home.doctorEyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-light leading-tight sm:text-6xl">
            {dictionary.home.doctorTitle}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            {dictionary.home.doctorBody}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line/60 pt-8">
            {[
              ["15+", dictionary.home.statsYears],
              ["5k+", dictionary.home.statsPatients],
              ["12", dictionary.home.statsAwards],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-semibold text-accent">{value}</p>
                <p className="label-caps mt-2 text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line/30 bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <p className="label-caps text-accent">{dictionary.home.servicesEyebrow}</p>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-3xl font-light leading-tight sm:text-5xl">
              {dictionary.home.servicesTitle}
            </h2>
            <Link
              href={`/${locale}/services`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent"
            >
              {dictionary.navigation.services}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {serviceKeys.map((service, index) => (
              <Link
                key={service}
                href={`/${locale}/services`}
                className="group flex min-h-56 flex-col justify-between rounded-lg border border-line/50 bg-background p-6 ambient-shadow transition hover:-translate-y-1 hover:border-champagne"
              >
                <div className="flex items-start justify-between">
                  <Sparkles className="text-champagne transition group-hover:text-accent" size={24} aria-hidden="true" />
                  <span className="text-3xl font-light text-accent/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xl font-medium">{dictionary.services[service]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <p className="label-caps text-accent">{dictionary.home.reviewsEyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight sm:text-5xl">
          {dictionary.home.reviewsTitle}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviewKeys.map((review) => (
            <figure key={review} className="rounded-lg border-t-2 border-champagne bg-surface p-8 ambient-shadow">
              <div className="mb-6 flex gap-1 text-champagne">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-base leading-7 text-muted">
                &ldquo;{dictionary.reviews[review]}&rdquo;
              </blockquote>
              <figcaption className="label-caps mt-8 text-accent">
                {dictionary.reviewAuthors[review]}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-20">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-between gap-8 overflow-hidden rounded-lg bg-accent px-6 py-14 text-surface sm:px-10 md:flex-row md:items-center">
          <div className="absolute right-10 top-10 hidden gap-5 text-surface/15 md:flex">
            <ShieldCheck size={74} aria-hidden="true" />
            <Award size={74} aria-hidden="true" />
          </div>
          <div>
            <h2 className="max-w-2xl text-3xl font-light leading-tight sm:text-5xl">
              {dictionary.home.ctaTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-surface/75">
              {dictionary.home.ctaBody}
            </p>
          </div>
          <Link
            href={`/${locale}/booking`}
            className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-sm bg-champagne px-8 text-sm font-semibold text-foreground transition hover:scale-[1.03] hover:bg-surface"
          >
            {dictionary.home.bookButton}
          </Link>
        </div>
      </section>
    </>
  );
}
