import { BarChart3, CalendarDays, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { logout } from "@/app/admin/login/actions";
import { brand } from "@/config/brand";

const adminNav = [
  { href: "/admin/appointments", label: "Ραντεβού", icon: CalendarDays },
  { href: "/admin/settings", label: "Ρυθμίσεις", icon: Settings },
  { href: "/admin/insights", label: "Στατιστικά", icon: BarChart3 },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em]">
              {brand.clinicName}
            </p>
            <p className="mt-1 text-xs text-muted">{email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 border border-line px-4 text-sm font-medium transition hover:border-accent"
            >
              <LogOut size={16} aria-hidden="true" />
              Αποσύνδεση
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <nav className="grid gap-2">
            {adminNav.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-12 items-center gap-3 border border-line bg-surface px-4 text-sm font-medium transition hover:border-accent"
                >
                  <Icon size={18} className="text-accent" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
