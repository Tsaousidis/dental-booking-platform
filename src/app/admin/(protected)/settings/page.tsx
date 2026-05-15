import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSettings } from "@/lib/admin/settings";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Settings"
        description="Edit the core clinic profile, appointment types, and booking rules from one calm page."
      />
      <SettingsForm data={settings} />
    </div>
  );
}
