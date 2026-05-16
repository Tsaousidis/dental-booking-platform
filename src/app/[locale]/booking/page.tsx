import type { Metadata } from "next";

import { BookingFlow } from "@/components/booking/BookingFlow";
import { type Locale } from "@/config/locales";
import { getPublicAppointmentTypes } from "@/lib/booking/appointment-types";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({ locale, page: "booking", path: "/booking" });
}

export default async function BookingPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const appointmentTypes = await getPublicAppointmentTypes(locale);

  return <BookingFlow locale={locale} appointmentTypes={appointmentTypes} />;
}
