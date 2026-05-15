import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { brand } from "@/config/brand";
import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

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
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href={`/${locale}`} className="min-w-0">
          <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-foreground">
            {brand.clinicName}
          </span>
          <span className="mt-1 block text-xs text-muted">{brand.city}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className="transition hover:text-foreground"
            >
              {dictionary.navigation[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/booking`}
            className="hidden min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent sm:inline-flex"
          >
            <CalendarDays size={17} aria-hidden="true" />
            {dictionary.navigation.book}
          </Link>
        </div>
      </div>
    </header>
  );
}
