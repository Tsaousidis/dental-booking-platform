"use client";

import { BarChart3, CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  { href: "/admin/appointments", label: "Ραντεβού", icon: CalendarDays },
  { href: "/admin/settings", label: "Ρυθμίσεις", icon: Settings },
  { href: "/admin/insights", label: "Στατιστικά", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible xl:pb-0">
      {adminNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-12 shrink-0 items-center gap-3 rounded-lg border px-4 text-sm font-medium ambient-shadow transition hover:-translate-y-0.5 hover:border-champagne xl:shrink ${
              isActive
                ? "border-accent bg-accent text-surface"
                : "border-line/50 bg-surface text-foreground"
            }`}
          >
            <Icon
              size={18}
              className={isActive ? "text-surface" : "text-accent"}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
