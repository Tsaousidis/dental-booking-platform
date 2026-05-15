import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminAppointmentsPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Ραντεβού"
        description="Εδώ θα εμφανίζονται τα επερχόμενα και παλαιότερα ραντεβού μόλις συνδεθεί η δημιουργία booking με το Supabase."
      />
      <section className="border border-line bg-surface p-6">
        <p className="text-sm text-muted">Η βάση για τη διαχείριση ραντεβού είναι έτοιμη.</p>
      </section>
    </div>
  );
}
