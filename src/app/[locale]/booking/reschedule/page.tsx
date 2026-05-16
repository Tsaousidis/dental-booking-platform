import { RescheduleAppointmentPanel } from "@/components/booking/RescheduleAppointmentPanel";
import { type Locale } from "@/config/locales";
import { getRescheduleAppointmentDetails } from "@/lib/booking/reschedule-data";

export const dynamic = "force-dynamic";

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
