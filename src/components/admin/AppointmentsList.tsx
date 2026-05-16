import { formatInTimeZone } from "date-fns-tz";

import {
  type AdminAppointment,
  type AppointmentStatus,
  updateAppointmentStatus,
} from "@/lib/admin/appointments";

const statusLabels: Record<AppointmentStatus, string> = {
  confirmed: "Επιβεβαιωμένο",
  completed: "Ολοκληρωμένο",
  cancelled: "Ακυρωμένο",
  no_show: "No-show",
};

const statusOptions: AppointmentStatus[] = [
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export function AppointmentsList({
  appointments,
}: {
  appointments: AdminAppointment[];
}) {
  const now = new Date();
  const upcoming = appointments.filter((appointment) => new Date(appointment.end_at) >= now);
  const past = appointments.filter((appointment) => new Date(appointment.end_at) < now);

  return (
    <div className="grid gap-6">
      <AppointmentSection title="Επερχόμενα ραντεβού" appointments={upcoming} />
      <AppointmentSection title="Παλαιότερα ραντεβού" appointments={past} />
    </div>
  );
}

function AppointmentSection({
  title,
  appointments,
}: {
  title: string;
  appointments: AdminAppointment[];
}) {
  return (
    <section className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted">{appointments.length} ραντεβού</p>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-6 border border-line bg-background p-5 text-sm text-muted">
          Δεν υπάρχουν ραντεβού σε αυτή την ενότητα.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </section>
  );
}

function AppointmentCard({ appointment }: { appointment: AdminAppointment }) {
  return (
    <article className="grid gap-5 border border-line bg-background p-5 xl:grid-cols-[1fr_220px]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-semibold">{appointment.patient_name}</h3>
          <span className="border border-line bg-surface px-3 py-1 text-xs font-semibold">
            {statusLabels[appointment.status]}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted">
          {appointment.appointment_types?.name_el ?? "Άλλη θεραπεία"} ·{" "}
          {formatAppointmentRange(appointment.start_at, appointment.end_at)}
        </p>
        <div className="mt-5 grid gap-2 text-sm leading-6 text-muted md:grid-cols-2">
          <p>Email: {appointment.patient_email}</p>
          <p>Τηλέφωνο: {appointment.patient_phone}</p>
          {appointment.patient_note ? (
            <p className="md:col-span-2">Σημείωση: {appointment.patient_note}</p>
          ) : null}
        </div>
      </div>

      <form action={updateAppointmentStatus} className="grid content-end gap-3">
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <label className="grid gap-2 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={appointment.status}
            className="min-h-11 border border-line bg-surface px-3 text-base outline-none transition focus:border-accent"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent"
        >
          Αποθήκευση status
        </button>
      </form>
    </article>
  );
}

function formatAppointmentRange(startAt: string, endAt: string) {
  const date = formatInTimeZone(startAt, "Europe/Athens", "dd/MM/yyyy");
  const start = formatInTimeZone(startAt, "Europe/Athens", "HH:mm");
  const end = formatInTimeZone(endAt, "Europe/Athens", "HH:mm");

  return `${date}, ${start}-${end}`;
}
