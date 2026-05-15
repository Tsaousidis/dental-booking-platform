import { Save } from "lucide-react";

import {
  type AdminSettingsData,
  saveAdminSettings,
} from "@/lib/admin/settings";

export function SettingsForm({ data }: { data: AdminSettingsData }) {
  const { doctorProfile, bookingSettings, appointmentTypes } = data;

  if (!doctorProfile || !bookingSettings) {
    return (
      <section className="border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold">Λείπουν αρχικά δεδομένα</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Τρέξτε το `supabase/seed.sql` στο Supabase SQL editor πριν επεξεργαστείτε τις ρυθμίσεις.
        </p>
      </section>
    );
  }

  return (
    <form action={saveAdminSettings} className="grid gap-6">
      <input type="hidden" name="doctor_profile_id" value={doctorProfile.id} />
      <input type="hidden" name="booking_settings_id" value={bookingSettings.id} />
      <input
        type="hidden"
        name="appointment_type_ids"
        value={appointmentTypes.map((type) => type.id).join(",")}
      />

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Προφίλ κλινικής"
          description="Βασικά rebrandable στοιχεία που χρησιμοποιούνται στην ιστοσελίδα και στα emails."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Όνομα γιατρού" name="doctor_name" defaultValue={doctorProfile.doctor_name} />
          <TextField label="Όνομα κλινικής" name="clinic_name" defaultValue={doctorProfile.clinic_name} />
          <TextField label="Email" name="email" type="email" defaultValue={doctorProfile.email} />
          <TextField label="Τηλέφωνο" name="phone" defaultValue={doctorProfile.phone} />
          <TextField label="Διεύθυνση" name="address" defaultValue={doctorProfile.address} />
          <TextField label="Πόλη" name="city" defaultValue={doctorProfile.city} />
          <TextField
            label="Ζώνη ώρας"
            name="profile_timezone"
            defaultValue={doctorProfile.timezone}
          />
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Κανόνες booking"
          description="Κανόνες που χρησιμοποιεί το availability engine πριν επιβεβαιωθεί ένα ραντεβού."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NumberField
            label="Μέχρι πόσες μέρες μπροστά"
            name="booking_horizon_days"
            defaultValue={bookingSettings.booking_horizon_days}
            min={1}
            suffix="μέρες"
          />
          <NumberField
            label="Κενό ανάμεσα στα ραντεβού"
            name="buffer_minutes"
            defaultValue={bookingSettings.buffer_minutes}
            min={0}
            suffix="λεπτά"
          />
          <NumberField
            label="Ελάχιστη προειδοποίηση"
            name="min_notice_hours"
            defaultValue={bookingSettings.min_notice_hours}
            min={0}
            suffix="ώρες"
          />
          <TextField
            label="Ζώνη ώρας booking"
            name="booking_timezone"
            defaultValue={bookingSettings.timezone}
          />
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Τύποι ραντεβού"
          description="Επεξεργασία ονομάτων θεραπείας, διάρκειας, ενεργής κατάστασης και σειράς εμφάνισης."
        />
        <div className="mt-6 grid gap-4">
          {appointmentTypes.map((type) => (
            <div key={type.id} className="grid gap-4 border border-line bg-background p-4 lg:grid-cols-[1fr_1fr_150px_120px_120px]">
              <TextField
                label="Όνομα στα Ελληνικά"
                name={`appointment_type_${type.id}_name_el`}
                defaultValue={type.name_el}
              />
              <TextField
                label="Όνομα στα Αγγλικά"
                name={`appointment_type_${type.id}_name_en`}
                defaultValue={type.name_en}
              />
              <NumberField
                label="Διάρκεια"
                name={`appointment_type_${type.id}_duration_minutes`}
                defaultValue={type.duration_minutes}
                min={1}
                suffix="min"
              />
              <NumberField
                label="Σειρά"
                name={`appointment_type_${type.id}_sort_order`}
                defaultValue={type.sort_order}
                min={0}
              />
              <label className="flex items-end gap-3 pb-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name={`appointment_type_${type.id}_is_active`}
                  defaultChecked={type.is_active}
                  className="h-5 w-5 accent-[var(--accent)]"
                />
                Ενεργό
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 border border-line bg-surface p-4 shadow-[0_-12px_30px_rgba(23,23,23,0.08)]">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-accent sm:w-auto"
        >
          <Save size={17} aria-hidden="true" />
          Αποθήκευση αλλαγών
        </button>
      </div>
    </form>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required
        className="min-h-11 border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
      />
    </label>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  min,
  suffix,
}: {
  label: string;
  name: string;
  defaultValue: number;
  min: number;
  suffix?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <span className="flex min-h-11 items-center border border-line bg-background focus-within:border-accent">
        <input
          name={name}
          type="number"
          min={min}
          defaultValue={defaultValue}
          required
          className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none"
        />
        {suffix ? <span className="pr-3 text-sm text-muted">{suffix}</span> : null}
      </span>
    </label>
  );
}
