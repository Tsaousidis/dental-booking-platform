import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSettings } from "@/lib/admin/settings";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Ρυθμίσεις"
        description="Επεξεργασία βασικών στοιχείων κλινικής, τύπων ραντεβού και κανόνων booking από μία απλή σελίδα."
      />
      <SettingsForm data={settings} />
    </div>
  );
}
