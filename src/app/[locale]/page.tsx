import { HomePageSections } from "@/components/public/HomePageSections";
import { type Locale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return <HomePageSections locale={locale} dictionary={dictionary} />;
}
