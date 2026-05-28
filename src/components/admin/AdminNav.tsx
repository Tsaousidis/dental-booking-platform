"use client";

import { BarChart3, CalendarDays, Menu, Settings, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminNav = [
  { href: "/admin/appointments", label: "Ραντεβού", icon: CalendarDays },
  { href: "/admin/patients", label: "Ασθενείς", icon: UserRound },
  { href: "/admin/settings", label: "Ρυθμίσεις", icon: Settings },
  { href: "/admin/insights", label: "Στατιστικά", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = adminNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const ActiveIcon = activeItem?.icon;

  return (
    <nav>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between rounded-lg border border-line/50 bg-surface px-4 text-sm font-semibold ambient-shadow xl:hidden"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="inline-flex items-center gap-3">
          {ActiveIcon ? <ActiveIcon size={18} className="text-accent" aria-hidden="true" /> : null}
          {activeItem?.label ?? "Menu"}
        </span>
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div className={`${isOpen ? "grid" : "hidden"} mt-2 gap-2 xl:mt-0 xl:grid`}>
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`flex min-h-12 items-center gap-3 rounded-lg border px-4 text-sm font-medium ambient-shadow transition hover:-translate-y-0.5 hover:border-champagne ${
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
      </div>
    </nav>
  );
}
