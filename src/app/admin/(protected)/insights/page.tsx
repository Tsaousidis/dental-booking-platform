import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const metrics = ["Total bookings", "This month", "Completed", "Cancelled", "No-show"];

export default function AdminInsightsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Insights"
        description="Simple doctor-only metrics will summarize bookings, outcomes, busiest days, busiest hours, and service demand."
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
