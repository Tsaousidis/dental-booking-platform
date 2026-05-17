import Link from "next/link";

import { locales, type Locale } from "@/config/locales";

const flags: Record<Locale, string> = {
  el: "GR",
  en: "EN",
};

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-2" aria-label="Language switcher">
      {locales.map((item) => (
        <Link
          key={item}
          href={`/${item}`}
          aria-current={item === locale ? "page" : undefined}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-xs font-semibold transition ${
            item === locale
              ? "border-accent bg-accent text-surface"
              : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
          }`}
        >
          {flags[item]}
        </Link>
      ))}
    </div>
  );
}
