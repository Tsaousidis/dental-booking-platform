import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

export function StickyMobileBookingCTA({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line/60 bg-surface/95 p-3 shadow-[0_-12px_30px_rgba(104,92,82,0.14)] backdrop-blur sm:hidden">
      <Link
        href={`/${locale}/booking`}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-accent px-5 text-sm font-semibold text-surface"
      >
        <CalendarDays size={18} aria-hidden="true" />
        {dictionary.navigation.book}
      </Link>
    </div>
  );
}
