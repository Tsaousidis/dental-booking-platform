import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AppointmentsList } from "@/components/admin/AppointmentsList";
import { getAdminAppointments, updateAppointmentStatus } from "@/lib/admin/appointments";

export default async function AdminAppointmentsPage() {
  const appointments = await getAdminAppointments();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Ραντεβού"
        description="Προβολή επερχόμενων και παλαιότερων ραντεβού, με γρήγορη αλλαγή status από τον γιατρό."
      />
      <AppointmentsList
        appointments={appointments}
        updateStatusAction={updateAppointmentStatus}
      />
    </div>
  );
}
