import { LogOut } from "lucide-react";
import { type ReactNode } from "react";

import { logout } from "@/app/admin/login/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { BrandMark } from "@/components/layout/BrandMark";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-line/40 bg-surface/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="min-w-0">
            <BrandMark />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-line px-4 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              <LogOut size={16} aria-hidden="true" />
              Αποσύνδεση
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 xl:grid-cols-[220px_1fr]">
        <aside className="min-w-0 xl:sticky xl:top-28 xl:self-start">
          <AdminNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
