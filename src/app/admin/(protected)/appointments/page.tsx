import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminAppointmentsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Appointments"
        description="Upcoming and past appointments will appear here once booking creation is connected to Supabase."
      />
      <section className="border border-line bg-surface p-6">
        <p className="text-sm text-muted">Appointment management foundation ready.</p>
      </section>
    </div>
  );
}
