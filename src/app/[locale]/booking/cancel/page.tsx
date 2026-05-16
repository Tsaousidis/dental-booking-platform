import { CancelAppointmentPanel } from "@/components/booking/CancelAppointmentPanel";
import { type Locale } from "@/config/locales";
import { getCancelAppointmentDetails } from "@/lib/booking/cancel-data";

export const dynamic = "force-dynamic";

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
