import { formatInTimeZone } from "date-fns-tz";
import { Save } from "lucide-react";
import Link from "next/link";

import { AppointmentTypesOrderList } from "@/components/admin/AppointmentTypesOrderList";
import {
  type AdminSettingsData,
  type BlockedSlot,
  saveAdminSettings,
} from "@/lib/admin/settings";

const dayLabels = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];

export function SettingsForm({ data }: { data: AdminSettingsData }) {
  const {
    doctorProfile,
    bookingSettings,
    notificationSettings,
    appointmentTypes,
    doctorSchedule,
    scheduleBreaks,
    blockedSlots,
    googleCalendarConnection,
  } = data;

  if (!doctorProfile || !bookingSettings) {
    return (
      <section className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
        <h2 className="text-xl font-medium">Λείπουν αρχικά δεδομένα</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Τρέξτε το `supabase/seed.sql` στο Supabase SQL editor πριν επεξεργαστείτε
          τις ρυθμίσεις.
        </p>
      </section>
    );
  }

  const timezone = bookingSettings.timezone || "Europe/Athens";
  const orderedDoctorSchedule = [...doctorSchedule].sort(
    (left, right) => sortWeekday(left.day_of_week) - sortWeekday(right.day_of_week),
  );

  return (
    <form action={saveAdminSettings} className="grid gap-6">
      <input type="hidden" name="doctor_profile_id" value={doctorProfile.id} />
      <input type="hidden" name="booking_settings_id" value={bookingSettings.id} />
      {notificationSettings ? (
        <input type="hidden" name="notification_settings_id" value={notificationSettings.id} />
      ) : null}
      <input
        type="hidden"
        name="appointment_type_ids"
        value={appointmentTypes.map((type) => type.id).join(",")}
      />
      <input
        type="hidden"
        name="schedule_ids"
        value={doctorSchedule.map((day) => day.id).join(",")}
      />
      <input
        type="hidden"
        name="break_ids"
        value={scheduleBreaks.map((item) => item.id).join(",")}
      />
      <input
        type="hidden"
        name="blocked_slot_ids"
        value={blockedSlots.map((item) => item.id).join(",")}
      />

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Προφίλ κλινικής"
          description="Βασικά στοιχεία που χρησιμοποιούνται στην ιστοσελίδα και στα emails."
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
          title="Εργάσιμες ώρες ανά ημέρα"
          description="Εργάσιμες ημέρες και ώρες."
        />
        <div className="mt-6 grid gap-3">
          {orderedDoctorSchedule.map((day) => (
            <div
              key={day.id}
              className="grid gap-4 border border-line bg-background p-4 md:grid-cols-[1fr_130px_130px_120px]"
            >
              <div>
                <p className="text-sm font-semibold">{dayLabels[day.day_of_week]}</p>
              </div>
              <TimeSelectField
                label="Έναρξη"
                name={`schedule_${day.id}_start_time`}
                defaultValue={normalizeTime(day.start_time)}
                required={false}
              />
              <TimeSelectField
                label="Λήξη"
                name={`schedule_${day.id}_end_time`}
                defaultValue={normalizeTime(day.end_time)}
                required={false}
              />
              <label className="flex items-end gap-3 pb-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name={`schedule_${day.id}_is_working`}
                  defaultChecked={day.is_working}
                  className="h-5 w-5 accent-[var(--accent)]"
                />
                Εργάσιμη
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Διαλείμματα"
          description="Αφαιρούνται από τη διαθεσιμότητα και δεν επιτρέπουν κράτηση."
        />
        <div className="mt-6 grid gap-3">
          {scheduleBreaks.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 border border-line bg-background p-4 md:grid-cols-[1fr_130px_130px_120px]"
            >
              <SelectField
                label="Ημέρα"
                name={`break_${item.id}_day_of_week`}
                defaultValue={String(item.day_of_week)}
              />
              <TimeSelectField
                label="Έναρξη"
                name={`break_${item.id}_start_time`}
                defaultValue={normalizeTime(item.start_time)}
              />
              <TimeSelectField
                label="Λήξη"
                name={`break_${item.id}_end_time`}
                defaultValue={normalizeTime(item.end_time)}
              />
              <DeleteCheckbox name={`break_${item.id}_delete`} />
            </div>
          ))}
          <div className="grid gap-4 border border-dashed border-line bg-background p-4 md:grid-cols-[1fr_130px_130px_120px]">
            <SelectField label="Νέο διάλειμμα" name="new_break_day_of_week" />
            <TimeSelectField label="Έναρξη" name="new_break_start_time" required={false} />
            <TimeSelectField label="Λήξη" name="new_break_end_time" required={false} />
            <p className="flex items-end pb-3 text-sm text-muted">Προσθήκη με αποθήκευση</p>
          </div>
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Κανόνες κρατήσεων"
          description="Ρυθμίσεις που καθορίζουν πότε μπορεί ένας ασθενής να κλείσει ραντεβού online."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <NumberField
            label="Μέχρι πόσες μέρες μπροστά"
            name="booking_horizon_days"
            defaultValue={bookingSettings.booking_horizon_days}
            min={1}
            suffix="μέρες"
            description="Πόσο μακριά στο μέλλον θα βλέπει διαθέσιμες ημέρες ο ασθενής. Π.χ. 60 σημαίνει ότι μπορεί να κλείσει ραντεβού μέσα στις επόμενες 60 ημέρες."
          />
          <NumberField
            label="Κενό ανάμεσα στα ραντεβού"
            name="buffer_minutes"
            defaultValue={bookingSettings.buffer_minutes}
            min={0}
            suffix="λεπτά"
            description="Χρόνος που μένει κενός μετά από κάθε ραντεβού για προετοιμασία, καθαρισμό ή μικρή καθυστέρηση."
          />
          <NumberField
            label="Ελάχιστη προειδοποίηση"
            name="min_notice_hours"
            defaultValue={bookingSettings.min_notice_hours}
            min={0}
            suffix="ώρες"
            description="Πόσες ώρες νωρίτερα πρέπει να κλείσει κάποιος. Π.χ. 12 σημαίνει ότι δεν μπορεί να κλείσει ραντεβού για τις επόμενες 12 ώρες."
          />
          <TimezoneSelectField
            label="Ζώνη ώρας booking"
            name="booking_timezone"
            defaultValue={bookingSettings.timezone}
            description="Η ώρα με την οποία υπολογίζονται και εμφανίζονται τα online ραντεβού. Για Ελλάδα κρατήστε Europe/Athens."
          />
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Μη διαθέσιμες ώρες"
          description="Κλείστε χειροκίνητα ώρες ή ολόκληρα διαστήματα που δεν θέλετε να εμφανίζονται διαθέσιμα για online ραντεβού."
        />
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Παράδειγμα: αν έχετε προσωπικό ραντεβού στις 22/05/2026 από 14:00 έως 16:00,
          βάλτε αυτό το διάστημα εδώ για να μην μπορεί κάποιος να το κλείσει online.
        </p>
        <div className="mt-6 grid gap-3">
          {blockedSlots.map((slot) => (
            <BlockedSlotRow key={slot.id} slot={slot} timezone={timezone} />
          ))}
          <div className="grid gap-4 border border-dashed border-line bg-background p-4 lg:grid-cols-[1fr_1fr_1fr_120px]">
            <BlockedDateTimeField label="Μη διαθέσιμο από" name="new_blocked_start_at" required={false} />
            <BlockedDateTimeField label="Μη διαθέσιμο έως" name="new_blocked_end_at" required={false} />
            <TextField label="Αιτία" name="new_blocked_reason" defaultValue="" required={false} />
            <p className="flex items-end pb-3 text-sm text-muted">Προσθήκη με αποθήκευση</p>
          </div>
        </div>
      </section>

      {notificationSettings ? (
        <section className="border border-line bg-surface p-6">
          <SectionHeader
            title="Ειδοποιήσεις"
            description="Έλεγχος για το ποια emails στέλνονται αυτόματα σε ασθενή και γιατρό."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="border border-line bg-background p-4">
              <h3 className="text-base font-semibold">Emails ασθενή</h3>
              <div className="mt-4 grid gap-3">
                <ToggleField
                  label="Επιβεβαίωση νέου ραντεβού"
                  name="patient_confirmation_email_enabled"
                  defaultChecked={notificationSettings.patient_confirmation_email_enabled}
                />
                <ToggleField
                  label="Υπενθύμιση ραντεβού"
                  name="patient_reminder_email_enabled"
                  defaultChecked={notificationSettings.patient_reminder_email_enabled}
                />
                <ToggleField
                  label="Επιβεβαίωση ακύρωσης"
                  name="patient_cancellation_email_enabled"
                  defaultChecked={notificationSettings.patient_cancellation_email_enabled}
                />
                <ToggleField
                  label="Επιβεβαίωση αλλαγής ώρας"
                  name="patient_reschedule_email_enabled"
                  defaultChecked={notificationSettings.patient_reschedule_email_enabled}
                />
                <ToggleField
                  label="Αίτημα αξιολόγησης μετά την επίσκεψη"
                  name="patient_review_request_email_enabled"
                  defaultChecked={notificationSettings.patient_review_request_email_enabled}
                />
              </div>
            </div>

            <div className="border border-line bg-background p-4">
              <h3 className="text-base font-semibold">Emails γιατρού</h3>
              <div className="mt-4 grid gap-3">
                <ToggleField
                  label="Νέο ραντεβού"
                  name="doctor_new_booking_email_enabled"
                  defaultChecked={notificationSettings.doctor_new_booking_email_enabled}
                />
                <ToggleField
                  label="Υπενθύμιση ραντεβού"
                  name="doctor_reminder_email_enabled"
                  defaultChecked={notificationSettings.doctor_reminder_email_enabled}
                />
                <ToggleField
                  label="Ακύρωση ραντεβού"
                  name="doctor_cancellation_email_enabled"
                  defaultChecked={notificationSettings.doctor_cancellation_email_enabled}
                />
                <ToggleField
                  label="Αλλαγή ώρας"
                  name="doctor_reschedule_email_enabled"
                  defaultChecked={notificationSettings.doctor_reschedule_email_enabled}
                />
              </div>
            </div>

            <NumberField
              label="Πότε στέλνεται υπενθύμιση"
              name="reminder_hours_before"
              defaultValue={notificationSettings.reminder_hours_before}
              min={1}
              suffix="ώρες πριν"
              compact
            />
          </div>
        </section>
      ) : null}

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Google Calendar"
          description="Σύνδεση με το ημερολόγιο του γιατρού ώστε κάθε νέο booking να δημιουργεί event αυτόματα."
        />
        <div className="mt-6 flex flex-col justify-between gap-4 border border-line bg-background p-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold">
              {googleCalendarConnection?.is_connected
                ? "Συνδεδεμένο"
                : "Δεν έχει συνδεθεί"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {googleCalendarConnection?.google_account_email ??
                "Συνδέστε Google Calendar από το κουμπί δεξιά."}
            </p>
          </div>
          <Link
            href="/api/google/connect"
            className="inline-flex min-h-11 items-center justify-center bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-accent"
          >
            {googleCalendarConnection?.is_connected
              ? "Επανασύνδεση"
              : "Σύνδεση Google Calendar"}
          </Link>
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <SectionHeader
          title="Τύποι ραντεβού"
          description="Επεξεργασία ονομάτων θεραπείας, διάρκειας και ενεργής κατάστασης. Η σειρά εμφάνισης κρατιέται αυτόματα με βάση τη λίστα."
        />
        <AppointmentTypesOrderList appointmentTypes={appointmentTypes} />
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 border border-dashed border-line bg-background p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px]">
            <TextField
              label="Νέος τύπος στα Ελληνικά"
              name="new_appointment_type_name_el"
              defaultValue=""
              required={false}
            />
            <TextField
              label="Νέος τύπος στα Αγγλικά"
              name="new_appointment_type_name_en"
              defaultValue=""
              required={false}
            />
            <NumberField
              label="Διάρκεια"
              name="new_appointment_type_duration_minutes"
              min={1}
              suffix="min"
              required={false}
            />
            <p className="text-sm text-muted lg:col-span-3">
              Προσθήκη με αποθήκευση
            </p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 rounded-lg border border-line/50 bg-surface/95 p-4 shadow-[0_-12px_30px_rgba(104,92,82,0.10)] backdrop-blur">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 text-sm font-semibold text-surface transition hover:scale-[1.02] hover:bg-foreground sm:w-auto"
        >
          <Save size={17} aria-hidden="true" />
          Αποθήκευση αλλαγών
        </button>
      </div>
    </form>
  );
}

function BlockedSlotRow({
  slot,
  timezone,
}: {
  slot: BlockedSlot;
  timezone: string;
}) {
  return (
    <div className="grid gap-4 border border-line bg-background p-4 lg:grid-cols-[1fr_1fr_1fr_120px]">
      <BlockedDateTimeField
        label="Από"
        name={`blocked_${slot.id}_start_at`}
        defaultValue={formatDateTime(slot.start_at, timezone)}
      />
      <BlockedDateTimeField
        label="Έως"
        name={`blocked_${slot.id}_end_at`}
        defaultValue={formatDateTime(slot.end_at, timezone)}
      />
      <TextField
        label="Αιτία"
        name={`blocked_${slot.id}_reason`}
        defaultValue={slot.reason ?? ""}
        required={false}
      />
      <DeleteCheckbox name={`blocked_${slot.id}_delete`} />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-medium">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
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
  description,
  compact = false,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: number;
  min: number;
  suffix?: string;
  description?: string;
  compact?: boolean;
  required?: boolean;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium">
      {label}
      <span
        className={`flex min-h-11 min-w-0 items-center rounded-sm border border-line bg-background focus-within:border-accent ${
          compact ? "w-fit" : "w-full"
        }`}
      >
        <input
          name={name}
          type="number"
          min={min}
          defaultValue={defaultValue ?? ""}
          required={required}
          className={`min-w-0 bg-transparent px-3 text-base outline-none ${
            compact ? "w-16 flex-none" : "w-full flex-1"
          }`}
        />
        {suffix ? <span className="shrink-0 pr-3 text-sm text-muted">{suffix}</span> : null}
      </span>
      {description ? <span className="text-xs leading-5 text-muted">{description}</span> : null}
    </label>
  );
}

const fallbackTimeZones = [
  "Europe/Athens",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Zurich",
  "Europe/Sofia",
  "Europe/Bucharest",
  "Europe/Istanbul",
  "UTC",
];

const supportedTimeZones =
  "supportedValuesOf" in Intl
    ? (Intl as typeof Intl & { supportedValuesOf: (input: "timeZone") => string[] }).supportedValuesOf(
        "timeZone",
      )
    : fallbackTimeZones;

const timezoneOptions = [
  "Europe/Athens",
  ...supportedTimeZones.filter((timezone) => timezone !== "Europe/Athens").sort(),
];

function TimezoneSelectField({
  label,
  name,
  defaultValue,
  description,
}: {
  label: string;
  name: string;
  defaultValue: string;
  description?: string;
}) {
  const options = timezoneOptions.includes(defaultValue)
    ? timezoneOptions
    : [defaultValue, ...timezoneOptions];

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        required
        className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
      >
        {options.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
      {description ? <span className="text-xs leading-5 text-muted">{description}</span> : null}
    </label>
  );
}

const timeSelectOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function TimeSelectField({
  label,
  name,
  defaultValue = "",
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
      >
        <option value="">--:--</option>
        {timeSelectOptions.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </label>
  );
}

function BlockedDateTimeField({
  label,
  name,
  defaultValue = "",
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const { date, time } = splitDateTimeValue(defaultValue);

  return (
    <fieldset className="grid gap-2 text-sm font-medium">
      {label}
      <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
        <input
          name={`${name}_date`}
          type="date"
          defaultValue={date}
          required={required}
          className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
        />
        <select
          name={`${name}_time`}
          defaultValue={time}
          required={required}
          className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
        >
          <option value="">--:--</option>
          {timeSelectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

function SelectField({
  label,
  name,
  defaultValue = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
      >
        <option value="">Επιλογή</option>
        {dayLabels.map((label, index) => (
          <option key={label} value={index}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DeleteCheckbox({ name }: { name: string }) {
  return (
    <label className="flex items-end gap-3 pb-3 text-sm font-medium text-red-700">
      <input type="checkbox" name={name} className="h-5 w-5 accent-red-700" />
      Διαγραφή
    </label>
  );
}

function ToggleField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-sm border border-line bg-surface px-3 text-sm font-medium">
      <span>{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-[var(--accent)]"
      />
    </label>
  );
}

function normalizeTime(value: string | null) {
  return value ? value.slice(0, 5) : "";
}

function splitDateTimeValue(value: string) {
  if (!value) {
    return { date: "", time: "" };
  }

  const [datePart, timePart = ""] = value.split("T");
  const [year, month, day] = datePart.split("-");

  return {
    date: year && month && day ? `${year}-${month}-${day}` : "",
    time: timePart.slice(0, 5),
  };
}

function sortWeekday(dayOfWeek: number) {
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

function formatDateTime(value: string, timezone: string) {
  return formatInTimeZone(value, timezone, "yyyy-MM-dd'T'HH:mm");
}
