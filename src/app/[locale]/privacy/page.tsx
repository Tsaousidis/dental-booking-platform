import { LegalContent } from "@/components/public/LegalContent";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";

export default async function PrivacyPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PublicPageShell
      eyebrow={dictionary.legalPages.eyebrow}
      title={dictionary.legalPages.privacyTitle}
    >
      <LegalContent
        body={dictionary.legalPages.privacyBody}
        notice={dictionary.legalPages.notice}
      />
    </PublicPageShell>
  );
}
