import { PublicPageShell } from "@/components/public/PublicPageShell";
import { ServicesContent } from "@/components/public/ServicesContent";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";

export default async function ServicesPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PublicPageShell
      eyebrow={dictionary.servicesPage.eyebrow}
      title={dictionary.servicesPage.title}
      intro={dictionary.servicesPage.intro}
    >
      <ServicesContent locale={locale} dictionary={dictionary} />
    </PublicPageShell>
  );
}
