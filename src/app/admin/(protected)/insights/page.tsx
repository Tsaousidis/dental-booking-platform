import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const metrics = ["Σύνολο bookings", "Αυτόν τον μήνα", "Ολοκληρωμένα", "Ακυρωμένα", "No-show"];

export default function AdminInsightsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Στατιστικά"
        description="Απλά στατιστικά μόνο για τον γιατρό: bookings, αποτελέσματα, πιο busy ημέρες, ώρες και ζήτηση υπηρεσιών."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <section key={metric} className="border border-line bg-surface p-5">
            <p className="text-sm text-muted">{metric}</p>
            <p className="mt-4 text-3xl font-semibold">--</p>
          </section>
        ))}
      </div>
    </div>
  );
}
