import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const sections = [
  "Clinic Profile",
  "Working Hours",
  "Breaks",
  "Appointment Types",
  "Booking Rules",
  "Notifications",
  "Google Calendar",
  "Blocked Slots",
];

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Settings"
        description="One calm settings page will control the clinic profile, schedule, booking rules, notifications, Google Calendar, and manual blocks."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <section key={section} className="border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold">{section}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              This section will connect to Supabase in the next admin settings step.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
