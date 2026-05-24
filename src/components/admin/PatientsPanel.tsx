"use client";

import { CalendarClock, FileText, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

import { type AdminPatient } from "@/lib/admin/patients";
import { normalizeGreekPhone } from "@/lib/phone";

type UpdatePatientNotesAction = (formData: FormData) => void | Promise<void>;

const statusLabels: Record<AdminPatient["appointments"][number]["status"], string> = {
  confirmed: "Επιβεβαιωμένο",
  completed: "Ολοκληρωμένο",
  cancelled: "Ακυρωμένο",
  no_show: "Μη προσέλευση",
};

export function PatientsPanel({
  patients,
  selectedPatientId,
  updateNotesAction,
}: {
  patients: AdminPatient[];
  selectedPatientId?: string;
  updateNotesAction: UpdatePatientNotesAction;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedPhoneSearch = normalizeGreekPhone(search);

  const filteredPatients = useMemo(() => {
    if (!normalizedSearch && !normalizedPhoneSearch) {
      return patients;
    }

    return patients.filter((patient) => {
      const searchable = [
        patient.display_name,
        patient.email ?? "",
        patient.phone,
        patient.normalized_phone,
        normalizeGreekPhone(patient.phone),
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(normalizedSearch) ||
        Boolean(normalizedPhoneSearch && searchable.includes(normalizedPhoneSearch))
      );
    });
  }, [normalizedPhoneSearch, normalizedSearch, patients]);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? filteredPatients[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <section className="rounded-lg border border-line/50 bg-surface p-4 ambient-shadow xl:self-start">
        <label className="flex min-h-12 items-center gap-3 rounded-lg border border-line/60 bg-background px-4 focus-within:border-accent">
          <Search size={18} className="shrink-0 text-accent" aria-hidden="true" />
          <span className="sr-only">Αναζήτηση ασθενή</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Όνομα, τηλέφωνο ή email"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>

        <div className="mt-4 grid max-h-[620px] gap-2 overflow-y-auto pr-1">
          {filteredPatients.length === 0 ? (
            <p className="rounded-lg border border-line/70 bg-background p-4 text-sm text-muted">
              Δεν βρέθηκε ασθενής με αυτά τα στοιχεία.
            </p>
          ) : null}
          {filteredPatients.map((patient) => {
            const isActive = patient.id === selectedPatient?.id;
            const lastAppointment = patient.appointments[0];

            return (
              <a
                key={patient.id}
                href={`/admin/patients?patient=${patient.id}`}
                className={`grid gap-2 rounded-lg border p-4 text-left transition hover:border-accent ${
                  isActive
                    ? "border-accent bg-accent text-surface"
                    : "border-line/60 bg-background text-foreground"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{patient.display_name}</p>
                    <p className={`mt-1 truncate text-xs ${isActive ? "text-surface/80" : "text-muted"}`}>
                      {patient.phone}
                    </p>
                  </div>
                  {patient.notes ? (
                    <FileText
                      size={16}
                      className={isActive ? "text-surface" : "text-accent"}
                      aria-label="Έχει σημειώσεις"
                    />
                  ) : null}
                </div>
                <p className={`truncate text-xs ${isActive ? "text-surface/80" : "text-muted"}`}>
                  {patient.appointments.length} ραντεβού
                  {lastAppointment ? ` · Τελευταίο ${formatShortDate(lastAppointment.start_at)}` : ""}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {selectedPatient ? (
        <PatientDetails patient={selectedPatient} updateNotesAction={updateNotesAction} />
      ) : (
        <section className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
          <p className="text-sm text-muted">Δεν υπάρχουν ακόμη ασθενείς.</p>
        </section>
      )}
    </div>
  );
}

function PatientDetails({
  patient,
  updateNotesAction,
}: {
  patient: AdminPatient;
  updateNotesAction: UpdatePatientNotesAction;
}) {
  const upcomingAppointments = patient.appointments.filter(
    (appointment) => new Date(appointment.end_at) >= new Date(),
  );
  const pastAppointments = patient.appointments.filter(
    (appointment) => new Date(appointment.end_at) < new Date(),
  );
  const lastAppointment = pastAppointments[0];
  const nextAppointment = upcomingAppointments
    .slice()
    .sort((first, second) => new Date(first.start_at).getTime() - new Date(second.start_at).getTime())[0];
  const mostBookedTreatment = getMostBookedTreatment(patient);

  return (
    <section className="grid gap-6">
      <div className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="label-caps text-accent">Καρτέλα ασθενή</p>
            <h2 className="mt-3 text-3xl font-light">{patient.display_name}</h2>
            <div className="mt-4 grid gap-1 text-sm text-muted">
              <p>{patient.phone}</p>
              {patient.email ? <a href={`mailto:${patient.email}`}>{patient.email}</a> : null}
              <p>Κωδικός τηλεφώνου: {patient.normalized_phone}</p>
            </div>
          </div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-champagne/30 text-accent">
            <UserRound size={24} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Σύνολο ραντεβού" value={patient.appointments.length.toString()} />
        <StatCard label="Επόμενο ραντεβού" value={nextAppointment ? formatShortDate(nextAppointment.start_at) : "Δεν υπάρχει"} />
        <StatCard label="Τελευταίο ραντεβού" value={lastAppointment ? formatShortDate(lastAppointment.start_at) : "Δεν υπάρχει"} />
        <StatCard label="Συχνότερη θεραπεία" value={mostBookedTreatment ?? "Δεν υπάρχει"} />
      </div>

      <form action={updateNotesAction} className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
        <input type="hidden" name="patient_id" value={patient.id} />
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-accent" aria-hidden="true" />
          <div>
            <h3 className="text-xl font-medium">Σημειώσεις γιατρού</h3>
            <p className="mt-1 text-sm text-muted">
              Εσωτερικές σημειώσεις για τη συνέχεια της φροντίδας. Δεν εμφανίζονται στον ασθενή και δεν στέλνονται σε email.
            </p>
          </div>
        </div>
        <textarea
          name="notes"
          defaultValue={patient.notes ?? ""}
          rows={6}
          className="mt-5 w-full rounded-sm border border-line bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
          placeholder="π.χ. προτιμά ήρεμη ενημέρωση πριν τη θεραπεία, είχε ευαισθησία μετά τον καθαρισμό..."
        />
        <button
          type="submit"
          className="mt-4 inline-flex min-h-11 items-center rounded-sm bg-accent px-5 text-sm font-semibold text-surface transition hover:bg-foreground"
        >
          Αποθήκευση σημειώσεων
        </button>
      </form>

      <section className="rounded-lg border border-line/50 bg-surface ambient-shadow">
        <div className="border-b border-line/50 px-5 py-4">
          <p className="label-caps text-accent">Ιστορικό</p>
          <h3 className="mt-1 text-xl font-medium">Ραντεβού ασθενή</h3>
        </div>
        {patient.appointments.length === 0 ? (
          <p className="m-5 rounded-lg border border-line/70 bg-background p-5 text-sm text-muted">
            Δεν υπάρχουν ραντεβού για αυτόν τον ασθενή.
          </p>
        ) : (
          <div className="divide-y divide-line/50">
            {patient.appointments.map((appointment) => (
              <div key={appointment.id} className="grid gap-3 px-5 py-4 md:grid-cols-[150px_1fr_130px] md:items-center">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <CalendarClock size={16} className="text-accent" aria-hidden="true" />
                  {formatAppointmentRange(appointment.start_at, appointment.end_at)}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {appointment.appointment_types?.name_el ?? "Άλλη θεραπεία"}
                  </p>
                  {appointment.patient_note ? (
                    <p className="mt-1 text-xs text-muted">Σημείωση ραντεβού: {appointment.patient_note}</p>
                  ) : null}
                </div>
                <span className="w-fit rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                  {statusLabels[appointment.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line/50 bg-surface p-4 ambient-shadow">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  );
}

function getMostBookedTreatment(patient: AdminPatient) {
  const counts = new Map<string, number>();

  patient.appointments.forEach((appointment) => {
    const treatment = appointment.appointment_types?.name_el ?? "Άλλη θεραπεία";
    counts.set(treatment, (counts.get(treatment) ?? 0) + 1);
  });

  return [...counts.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] ?? null;
}

function formatShortDate(value: string) {
  return formatInTimeZone(value, "Europe/Athens", "dd/MM/yyyy");
}

function formatAppointmentRange(startAt: string, endAt: string) {
  return `${formatInTimeZone(startAt, "Europe/Athens", "dd/MM/yyyy HH:mm")}-${formatInTimeZone(endAt, "Europe/Athens", "HH:mm")}`;
}
