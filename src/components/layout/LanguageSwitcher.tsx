import Link from "next/link";

import { locales, type Locale } from "@/config/locales";

const flags: Record<Locale, string> = {
  el: "GR",
  en: "EN",
};

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1" aria-label="Language switcher">
      {locales.map((item) => (
        <Link
          key={item}
          href={`/${item}`}
          aria-current={item === locale ? "page" : undefined}
          className={`inline-flex h-9 min-w-9 items-center justify-center border px-2 text-xs font-semibold transition ${
            item === locale
              ? "border-foreground bg-foreground text-background"
              : "border-line bg-surface text-foreground hover:border-accent"
          }`}
        >
          {flags[item]}
        </Link>
      ))}
    </div>
  );
}
