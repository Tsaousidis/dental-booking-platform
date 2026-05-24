import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PatientsPanel } from "@/components/admin/PatientsPanel";
import { getAdminPatients, updatePatientNotes } from "@/lib/admin/patients";

export default async function AdminPatientsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ patient?: string | string[] }>;
}>) {
  const { patient: patientParam } = await searchParams;
  const selectedPatientId = Array.isArray(patientParam) ? patientParam[0] : patientParam;
  const patients = await getAdminPatients();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Ασθενείς"
        description="Προφίλ ασθενών με βάση το τηλέφωνο, ιστορικό ραντεβού και εσωτερικές σημειώσεις για τη συνέχεια της φροντίδας."
      />
      <PatientsPanel
        patients={patients}
        selectedPatientId={selectedPatientId}
        updateNotesAction={updatePatientNotes}
      />
    </div>
  );
}

