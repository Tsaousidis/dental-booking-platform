import type { Metadata } from "next";

import { RescheduleAppointmentPanel } from "@/components/booking/RescheduleAppointmentPanel";
import { type Locale } from "@/config/locales";
import { getRescheduleAppointmentDetails } from "@/lib/booking/reschedule-data";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    page: "reschedule",
    path: "/booking/reschedule",
    noIndex: true,
  });
}

export default async function RescheduleBookingPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string }>;
}>) {
  const { locale } = await params;
  const { token = "" } = await searchParams;
  const appointment = token
    ? await getRescheduleAppointmentDetails({ token, locale })
    : null;

  return (
    <RescheduleAppointmentPanel
      locale={locale}
      token={token}
      appointment={appointment}
    />
  );
}
