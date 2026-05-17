import Link from "next/link";

import { brand } from "@/config/brand";
import { type Locale } from "@/config/locales";
import { type Dictionary } from "@/lib/i18n";

import { BrandMark } from "./BrandMark";

export function PublicFooter({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <footer className="border-t border-line/30 bg-surface py-16 text-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="text-accent">
            <BrandMark />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-6 text-muted">
            {dictionary.footer.tagline}
          </p>
        </div>
        <div className="text-sm leading-7 text-muted">
          <p className="font-medium text-foreground">{brand.doctorName}</p>
          <p>{brand.address}</p>
          <p>{brand.phone}</p>
          <p>{brand.email}</p>
        </div>
        <div className="text-sm leading-7">
          <p className="font-medium text-foreground">{dictionary.footer.legal}</p>
          <Link href={`/${locale}/privacy`} className="block text-muted transition hover:text-accent">
            Privacy
          </Link>
          <Link href={`/${locale}/cookies`} className="block text-muted transition hover:text-accent">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
