import { BookingFlow } from "@/components/booking/BookingFlow";
import { type Locale } from "@/config/locales";
import { getPublicAppointmentTypes } from "@/lib/booking/appointment-types";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const appointmentTypes = await getPublicAppointmentTypes(locale);

  return <BookingFlow locale={locale} appointmentTypes={appointmentTypes} />;
}
