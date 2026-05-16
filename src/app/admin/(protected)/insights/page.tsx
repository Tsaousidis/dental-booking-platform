import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminInsights } from "@/lib/admin/insights";

const eventLabels: Record<string, string> = {
  booking_completed: "Ολοκληρωμένες κρατήσεις",
  booking_cancelled: "Ακυρώσεις",
  booking_rescheduled: "Αλλαγές ραντεβού",
};

const metricLabels = [
  ["Σύνολο bookings", "totalBookings"],
  ["Αυτόν τον μήνα", "bookingsThisMonth"],
  ["Επιβεβαιωμένα", "confirmed"],
  ["Ολοκληρωμένα", "completed"],
  ["Ακυρωμένα", "cancelled"],
  ["No-show", "noShow"],
] as const;

export default async function AdminInsightsPage() {
  const insights = await getAdminInsights();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Στατιστικά"
        description="Απλή εικόνα για κρατήσεις, αποτελέσματα, δημοφιλείς υπηρεσίες και ώρες αιχμής."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {metricLabels.map(([label, key]) => (
          <section key={key} className="border border-line bg-surface p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-4 text-3xl font-semibold">{insights.metrics[key]}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InsightTable title="Πιο δημοφιλείς υπηρεσίες" rows={insights.mostBookedServices} />
        <InsightTable title="Πιο busy ημέρες" rows={insights.busiestDays} />
        <InsightTable title="Πιο busy ώρες" rows={insights.busiestHours} />
        <InsightTable
          title="Booking events"
          rows={insights.conversionEvents.map((event) => ({
            ...event,
            label: eventLabels[event.label] ?? event.label,
          }))}
        />
      </div>
    </div>
  );
}

function InsightTable({
  title,
  rows,
}: {
  title: string;
  rows: {
    label: string;
    value: number;
  }[];
}) {
  return (
    <section className="border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-6 border border-line bg-background p-5 text-sm text-muted">
          Δεν υπάρχουν ακόμα αρκετά δεδομένα.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Κατηγορία</th>
                <th className="px-4 py-3 text-right font-medium">Σύνολο</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
