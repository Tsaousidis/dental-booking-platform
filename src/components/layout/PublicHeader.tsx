"use client";

import { CalendarDays, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navItems = [
  { key: "home", href: "" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "contact", href: "/contact" },
] as const;

export function PublicHeader({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-line/40 bg-surface/85 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href={`/${locale}`}
          className="min-w-0 text-accent transition hover:text-foreground"
          onClick={() => setIsMenuOpen(false)}
        >
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className="label-caps text-muted transition hover:text-accent"
            >
              {dictionary.navigation[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/booking`}
            className="hidden min-h-11 items-center gap-2 rounded-sm bg-champagne px-5 text-sm font-semibold text-foreground transition hover:scale-[1.02] hover:bg-surface sm:inline-flex"
          >
            <CalendarDays size={17} aria-hidden="true" />
            {dictionary.navigation.book}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-accent lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div className="border-t border-line/40 bg-surface shadow-xl lg:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-5 py-4 sm:px-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className="border-b border-line/40 py-4 text-base font-semibold text-foreground transition hover:text-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                {dictionary.navigation[item.key]}
              </Link>
            ))}
            <Link
              href={`/${locale}/booking`}
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-accent px-5 text-sm font-semibold text-surface transition hover:scale-[1.01]"
              onClick={() => setIsMenuOpen(false)}
            >
              <CalendarDays size={17} aria-hidden="true" />
              {dictionary.navigation.book}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
