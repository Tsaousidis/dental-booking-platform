import { ArrowRight, Sparkles } from "lucide-react";
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
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 text-sm uppercase tracking-[0.24em] text-accent">
              {dictionary.home.heroEyebrow}
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] sm:text-7xl">
              {dictionary.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              {dictionary.home.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/booking`}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-foreground px-6 text-sm font-medium text-background transition hover:bg-accent"
              >
                {dictionary.home.bookButton}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                href={`/${locale}/services`}
                className="inline-flex min-h-12 items-center justify-center border border-line px-6 text-sm font-medium transition hover:border-accent"
              >
                {dictionary.home.secondaryButton}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden border border-line bg-background">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(251,250,248,0.25)),url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/50 bg-white/82 p-6 backdrop-blur">
              <p className="text-sm font-medium">{brand.doctorName}</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {brand.address} · {brand.phone}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-accent">
            {dictionary.home.doctorEyebrow}
          </p>
        </div>
        <div>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            {dictionary.home.doctorTitle}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            {dictionary.home.doctorBody}
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <p className="text-sm uppercase tracking-[0.22em] text-accent">
            {dictionary.home.servicesEyebrow}
          </p>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              {dictionary.home.servicesTitle}
            </h2>
            <Link
              href={`/${locale}/services`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"
            >
              {dictionary.navigation.services}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {serviceKeys.map((service) => (
              <Link
                key={service}
                href={`/${locale}/services`}
                className="group flex min-h-36 flex-col justify-between border border-line bg-background p-5 transition hover:border-accent"
              >
                <Sparkles className="text-accent" size={20} aria-hidden="true" />
                <span className="text-lg font-medium">{dictionary.services[service]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-sm uppercase tracking-[0.22em] text-accent">
          {dictionary.home.reviewsEyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
          {dictionary.home.reviewsTitle}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {reviewKeys.map((review) => (
            <figure key={review} className="border border-line bg-surface p-6">
              <blockquote className="text-base leading-7 text-muted">
                &ldquo;{dictionary.reviews[review]}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm font-medium">Verified patient</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-8 bg-foreground px-6 py-12 text-background sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
              {dictionary.home.ctaTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-background/70">
              {dictionary.home.ctaBody}
            </p>
          </div>
          <Link
            href={`/${locale}/booking`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center bg-background px-6 text-sm font-semibold text-foreground"
          >
            {dictionary.home.bookButton}
          </Link>
        </div>
      </section>
    </>
  );
}
