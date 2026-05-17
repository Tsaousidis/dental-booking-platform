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

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed: "border-accent/20 bg-champagne/30 text-accent",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  no_show: "border-amber-200 bg-amber-50 text-amber-800",
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
      <AppointmentSection title="Παλαιότερα ραντεβού" appointments={past} isMuted />
    </div>
  );
}

function AppointmentSection({
  title,
  appointments,
  isMuted = false,
}: {
  title: string;
  appointments: AdminAppointment[];
  isMuted?: boolean;
}) {
  return (
    <section className="rounded-lg border border-line/50 bg-surface ambient-shadow">
      <div className="flex flex-col justify-between gap-2 border-b border-line/50 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="label-caps text-accent">{isMuted ? "Ιστορικό" : "Πρόγραμμα"}</p>
          <h2 className="mt-1 text-xl font-medium">{title}</h2>
        </div>
        <p className="text-sm text-muted">{appointments.length} ραντεβού</p>
      </div>

      {appointments.length === 0 ? (
        <p className="m-5 rounded-lg border border-line/70 bg-background p-5 text-sm text-muted">
          Δεν υπάρχουν ραντεβού σε αυτή την ενότητα.
        </p>
      ) : (
        <div className="divide-y divide-line/50">
          <div className="hidden grid-cols-[90px_110px_1.2fr_1fr_130px_170px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted lg:grid">
            <span>Ημερομηνία</span>
            <span>Ώρα</span>
            <span>Ασθενής</span>
            <span>Θεραπεία</span>
            <span>Status</span>
            <span className="text-right">Αλλαγή</span>
          </div>
          {appointments.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </section>
  );
}

function AppointmentRow({ appointment }: { appointment: AdminAppointment }) {
  const date = formatInTimeZone(appointment.start_at, "Europe/Athens", "dd/MM");
  const time = formatInTimeZone(appointment.start_at, "Europe/Athens", "HH:mm");
  const endTime = formatInTimeZone(appointment.end_at, "Europe/Athens", "HH:mm");
  const timeRange = `${time}-${endTime}`;
  const treatment = appointment.appointment_types?.name_el ?? "Άλλη θεραπεία";

  return (
    <article className="grid gap-4 px-5 py-4 transition hover:bg-surface-low lg:grid-cols-[90px_110px_1.2fr_1fr_130px_170px] lg:items-center">
      <p className="text-sm font-semibold text-foreground">{date}</p>
      <p className="text-sm font-semibold text-accent">{timeRange}</p>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{appointment.patient_name}</p>
        <p className="mt-1 truncate text-xs text-muted">{appointment.patient_phone}</p>
      </div>

      <p className="truncate text-sm text-muted">{treatment}</p>

      <span
        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}
      >
        {statusLabels[appointment.status]}
      </span>

      <form action={updateAppointmentStatus} className="flex gap-2 lg:justify-end">
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <select
          name="status"
          defaultValue={appointment.status}
          aria-label="Αλλαγή status"
          className="min-h-10 min-w-0 flex-1 rounded-sm border border-line bg-surface px-2 text-sm outline-none transition focus:border-accent lg:max-w-32"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-10 rounded-sm bg-accent px-3 text-xs font-semibold text-surface transition hover:bg-foreground"
        >
          ΟΚ
        </button>
      </form>
    </article>
  );
}
