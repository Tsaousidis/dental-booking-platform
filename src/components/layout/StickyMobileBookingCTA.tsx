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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface p-3 shadow-[0_-12px_30px_rgba(23,23,23,0.08)] sm:hidden">
      <Link
        href={`/${locale}/booking`}
        className="flex min-h-12 w-full items-center justify-center gap-2 bg-foreground px-5 text-sm font-semibold text-background"
      >
        <CalendarDays size={18} aria-hidden="true" />
        {dictionary.navigation.book}
      </Link>
    </div>
  );
}
