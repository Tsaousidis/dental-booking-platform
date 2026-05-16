import type { Metadata } from "next";

import { CancelAppointmentPanel } from "@/components/booking/CancelAppointmentPanel";
import { type Locale } from "@/config/locales";
import { getCancelAppointmentDetails } from "@/lib/booking/cancel-data";
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
    page: "cancel",
    path: "/booking/cancel",
    noIndex: true,
  });
}

export default async function CancelBookingPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string }>;
}>) {
  const { locale } = await params;
  const { token = "" } = await searchParams;
  const appointment = token
    ? await getCancelAppointmentDetails({ token, locale })
    : null;

  return (
    <CancelAppointmentPanel
      locale={locale}
      token={token}
      appointment={appointment}
    />
  );
}
