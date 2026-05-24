"use client";

import { Search } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { formatInTimeZone } from "date-fns-tz";

import {
  type AdminAppointment,
  type AppointmentStatus,
} from "@/lib/admin/appointments";

const historyPageSize = 25;

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

type UpdateStatusAction = (formData: FormData) => void | Promise<void>;

export function AppointmentsList({
  appointments,
  updateStatusAction,
}: {
  appointments: AdminAppointment[];
  updateStatusAction: UpdateStatusAction;
}) {
  const [search, setSearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const normalizedSearch = search.trim().toLowerCase();
  const now = new Date();

  const filteredAppointments = useMemo(() => {
    if (!normalizedSearch) {
      return appointments;
    }

    return appointments.filter((appointment) =>
      appointment.patient_name.toLowerCase().includes(normalizedSearch),
    );
  }, [appointments, normalizedSearch]);

  const upcoming = filteredAppointments.filter((appointment) => new Date(appointment.end_at) >= now);
  const past = filteredAppointments.filter((appointment) => new Date(appointment.end_at) < now);
  const historyPageCount = Math.max(1, Math.ceil(past.length / historyPageSize));
  const visiblePast = past.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);

  return (
    <div className="grid gap-6">
      <label className="flex min-h-12 items-center gap-3 rounded-lg border border-line/60 bg-surface px-4 ambient-shadow focus-within:border-accent">
        <Search size={18} className="shrink-0 text-accent" aria-hidden="true" />
        <span className="sr-only">Αναζήτηση ασθενή</span>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setHistoryPage(1);
          }}
          placeholder="Αναζήτηση με όνομα ασθενή"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </label>

      <AppointmentSection
        title="Επερχόμενα ραντεβού"
        appointments={upcoming}
        updateStatusAction={updateStatusAction}
      />
      <AppointmentSection
        title="Παλαιότερα ραντεβού"
        appointments={visiblePast}
        totalCount={past.length}
        isMuted
        updateStatusAction={updateStatusAction}
      />

      {past.length > historyPageSize ? (
        <div className="flex flex-col gap-3 rounded-lg border border-line/50 bg-surface p-4 text-sm text-muted ambient-shadow sm:flex-row sm:items-center sm:justify-between">
          <span>
            Σελίδα {historyPage} από {historyPageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={historyPage === 1}
              onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
              className="min-h-10 rounded-sm border border-line px-4 font-semibold transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Προηγούμενα
            </button>
            <button
              type="button"
              disabled={historyPage === historyPageCount}
              onClick={() => setHistoryPage((page) => Math.min(historyPageCount, page + 1))}
              className="min-h-10 rounded-sm border border-line px-4 font-semibold transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Επόμενα
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AppointmentSection({
  title,
  appointments,
  totalCount = appointments.length,
  isMuted = false,
  updateStatusAction,
}: {
  title: string;
  appointments: AdminAppointment[];
  totalCount?: number;
  isMuted?: boolean;
  updateStatusAction: UpdateStatusAction;
}) {
  return (
    <section className="rounded-lg border border-line/50 bg-surface ambient-shadow">
      <div className="flex flex-col justify-between gap-2 border-b border-line/50 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="label-caps text-accent">{isMuted ? "Ιστορικό" : "Πρόγραμμα"}</p>
          <h2 className="mt-1 text-xl font-medium">{title}</h2>
        </div>
        <p className="text-sm text-muted">{totalCount} ραντεβού</p>
      </div>

      {appointments.length === 0 ? (
        <p className="m-5 rounded-lg border border-line/70 bg-background p-5 text-sm text-muted">
          Δεν υπάρχουν ραντεβού σε αυτή την ενότητα.
        </p>
      ) : (
        <div className="divide-y divide-line/50">
          <div className="hidden grid-cols-[90px_110px_1.25fr_1fr_120px_150px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted xl:grid">
            <span>Ημερομηνία</span>
            <span>Ώρα</span>
            <span>Ασθενής</span>
            <span>Θεραπεία</span>
            <span>Status</span>
            <span>Αλλαγή</span>
          </div>
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              updateStatusAction={updateStatusAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AppointmentRow({
  appointment,
  updateStatusAction,
}: {
  appointment: AdminAppointment;
  updateStatusAction: UpdateStatusAction;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();
  const date = formatInTimeZone(appointment.start_at, "Europe/Athens", "dd/MM");
  const localDate = formatInTimeZone(appointment.start_at, "Europe/Athens", "yyyy-MM-dd");
  const today = formatInTimeZone(new Date(), "Europe/Athens", "yyyy-MM-dd");
  const time = formatInTimeZone(appointment.start_at, "Europe/Athens", "HH:mm");
  const endTime = formatInTimeZone(appointment.end_at, "Europe/Athens", "HH:mm");
  const timeRange = `${time}-${endTime}`;
  const treatment = appointment.appointment_types?.name_el ?? "Άλλη θεραπεία";
  const isToday = localDate === today;

  return (
    <article className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 transition hover:bg-surface-low xl:grid-cols-[90px_110px_1.25fr_1fr_120px_150px] xl:items-center xl:gap-4">
      <div>
        <p className="label-caps mb-1 text-[10px] text-muted xl:hidden">Ημερομηνία</p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{date}</p>
          {isToday ? (
            <span className="rounded-full border border-accent/25 bg-champagne/40 px-2 py-0.5 text-[10px] font-semibold text-accent">
              Σήμερα
            </span>
          ) : null}
        </div>
      </div>
      <div>
        <p className="label-caps mb-1 text-[10px] text-muted xl:hidden">Ώρα</p>
        <p className="text-sm font-semibold text-accent">{timeRange}</p>
      </div>

      <div className="min-w-0">
        <p className="label-caps mb-1 text-[10px] text-muted xl:hidden">Ασθενής</p>
        <p className="truncate text-sm font-semibold">{appointment.patient_name}</p>
        <p className="mt-1 truncate text-xs text-muted">{appointment.patient_phone}</p>
        <a
          href={`mailto:${appointment.patient_email}`}
          className="mt-1 block truncate text-xs font-medium text-accent hover:text-foreground"
        >
          {appointment.patient_email}
        </a>
      </div>

      <div className="min-w-0">
        <p className="label-caps mb-1 text-[10px] text-muted xl:hidden">Θεραπεία</p>
        <p className="truncate text-sm text-muted">{treatment}</p>
      </div>

      <div>
        <p className="label-caps mb-1 text-[10px] text-muted xl:hidden">Status</p>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}
        >
          {statusLabels[appointment.status]}
        </span>
      </div>

      <form ref={formRef} action={updateStatusAction} className="flex xl:justify-end">
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <select
          name="status"
          defaultValue={appointment.status}
          aria-label="Αλλαγή status"
          onChange={() => {
            startTransition(() => {
              formRef.current?.requestSubmit();
            });
          }}
          className="min-h-10 min-w-0 flex-1 rounded-sm border border-line bg-surface px-2 text-sm outline-none transition focus:border-accent xl:max-w-36"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </form>
    </article>
  );
}
