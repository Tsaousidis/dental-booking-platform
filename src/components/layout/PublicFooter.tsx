import Link from "next/link";

import { brand } from "@/config/brand";
import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

export function PublicFooter({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <footer className="border-t border-line bg-foreground text-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold">{brand.clinicName}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-background/70">
            {dictionary.footer.tagline}
          </p>
        </div>
        <div className="text-sm leading-7 text-background/70">
          <p className="font-medium text-background">{brand.doctorName}</p>
          <p>{brand.address}</p>
          <p>{brand.phone}</p>
          <p>{brand.email}</p>
        </div>
        <div className="text-sm leading-7">
          <p className="font-medium">{dictionary.footer.legal}</p>
          <Link href={`/${locale}/privacy`} className="block text-background/70">
            Privacy
          </Link>
          <Link href={`/${locale}/cookies`} className="block text-background/70">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
