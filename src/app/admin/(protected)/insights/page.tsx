import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminInsights, type InsightPeriod } from "@/lib/admin/insights";

type InsightRow = {
  label: string;
  value: number;
};

const metricLabels = [
  ["Ραντεβού περιόδου", "totalBookings", "plain", "ραντεβού μέσα στο επιλεγμένο διάστημα"],
  ["Νέες κρατήσεις", "bookingsThisMonth", "plain", "κρατήσεις που δημιουργήθηκαν στο επιλεγμένο διάστημα"],
  ["Επιβεβαιωμένα", "confirmed", "status", "του συνόλου είναι επιβεβαιωμένα"],
  ["Ολοκληρωμένα", "completed", "status", "του συνόλου έχει ολοκληρωθεί"],
  ["Ακυρωμένα", "cancelled", "status", "του συνόλου έχει ακυρωθεί"],
  ["Μη προσέλευση", "noShow", "status", "του συνόλου δεν προσήλθε"],
] as const;

const periodLabels: Record<InsightPeriod, string> = {
  month: "Αυτός ο μήνας",
  quarter: "Τελευταίοι 3 μήνες",
  all: "Όλα",
};

function parsePeriod(value: string | string[] | undefined): InsightPeriod {
  return value === "quarter" || value === "all" ? value : "month";
}

export default async function AdminInsightsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ period?: string | string[] }>;
}>) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const insights = await getAdminInsights(period);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Στατιστικά"
        description="Απλή εικόνα για κρατήσεις, αποτελέσματα, δημοφιλείς υπηρεσίες και ώρες αιχμής."
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(periodLabels) as InsightPeriod[]).map((option) => (
          <Link
            key={option}
            href={`/admin/insights?period=${option}`}
            className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
              option === period
                ? "border-accent bg-accent text-surface"
                : "border-line bg-surface text-foreground hover:border-accent"
            }`}
          >
            {periodLabels[option]}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricLabels.map(([label, key, display, helper]) => (
          <section
            key={key}
            className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-line bg-surface p-5 text-center ambient-shadow"
          >
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-4 text-3xl font-semibold">{insights.metrics[key]}</p>
            {display === "status" ? (
              <div className="mt-5 flex justify-center">
                <MiniDonut
                  value={insights.metrics[key]}
                  total={Math.max(insights.metrics.totalBookings, 1)}
                  label={label}
                  helper={helper}
                />
              </div>
            ) : (
              <p className="mt-4 min-h-10 max-w-56 text-xs leading-5 text-muted">{helper}</p>
            )}
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InsightChart title="Καταστάσεις ραντεβού" rows={insights.statusBreakdown} variant="status" />
        <InsightChart title="Πιο δημοφιλείς υπηρεσίες" rows={insights.mostBookedServices} />
        <InsightChart title="Ημέρες αιχμής" rows={insights.busiestDays} />
        <InsightChart title="Ώρες αιχμής" rows={insights.busiestHours} />
        <InsightTrendChart title="Τάση κρατήσεων" rows={insights.bookingTrend} />
      </div>
    </div>
  );
}

function InsightChart({
  title,
  rows,
  variant = "default",
}: {
  title: string;
  rows: InsightRow[];
  variant?: "default" | "status";
}) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            {variant === "status" ? "Κατανομή ανά κατάσταση." : "Οι πιο συχνές επιλογές με βάση τα ραντεβού."}
          </p>
        </div>
        <span className="rounded-sm border border-line bg-background px-3 py-1 text-sm font-semibold">
          {total}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 border border-line bg-background p-5 text-sm text-muted">
          Δεν υπάρχουν ακόμα αρκετά δεδομένα.
        </p>
      ) : (
        <div className="mt-5 grid max-w-xl gap-3">
          {rows.map((row, index) => {
            const percentage = Math.round((row.value / maxValue) * 100);

            return (
              <div key={row.label} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-muted">{row.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-background">
                  <div
                    className={getBarClassName(index, variant)}
                    style={{ width: `${percentage}%` }}
                    aria-label={`${row.label}: ${row.value}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MiniDonut({
  value,
  total,
  label,
  helper,
}: {
  value: number;
  total: number;
  label: string;
  helper: string;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(value / total, 1);
  const strokeDasharray = `${circumference * ratio} ${circumference}`;

  return (
    <div className="flex items-center justify-center gap-4">
      <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90" aria-label={label}>
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(23,23,23,0.12)" strokeWidth="5" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
        />
      </svg>
      <div className="text-left">
        <p className="text-base font-semibold">{value === 0 ? "Καμία" : `${Math.round(ratio * 100)}%`}</p>
        <p className="text-xs leading-5 text-muted">{helper}</p>
      </div>
    </div>
  );
}

function InsightTrendChart({ title, rows }: { title: string; rows: InsightRow[] }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">Νέες κρατήσεις ανά ημέρα για το επιλεγμένο διάστημα.</p>
        </div>
        <span className="rounded-sm border border-line bg-background px-3 py-1 text-sm font-semibold">
          {total}
        </span>
      </div>
      <div className="mt-5 flex h-24 max-w-xl items-end gap-2" aria-label="Τάση κρατήσεων">
        {rows.map((row, index) => (
          <div key={row.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="h-4 text-[10px] font-semibold text-accent">
              {row.value > 0 ? row.value : ""}
            </span>
            <div
              title={`${row.label}: ${row.value}`}
              className={`w-full rounded-sm ${row.value > 0 ? "bg-accent" : "bg-line"}`}
              style={{ height: row.value > 0 ? `${Math.max((row.value / maxValue) * 70, 24)}%` : "2px" }}
            />
            <span className="hidden text-[11px] text-muted sm:block">
              {index % 3 === 0 || index === rows.length - 1 ? row.label : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getBarClassName(index: number, variant: "default" | "status") {
  if (variant === "status") {
    return [
      "h-full rounded-sm bg-accent",
      "h-full rounded-sm bg-champagne",
      "h-full rounded-sm bg-red-200",
      "h-full rounded-sm bg-foreground/30",
    ][index % 4];
  }

  return index === 0 ? "h-full rounded-sm bg-accent" : "h-full rounded-sm bg-champagne";
}
