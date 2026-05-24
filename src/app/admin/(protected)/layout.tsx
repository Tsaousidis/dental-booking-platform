import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { requireAdminUser } from "@/lib/admin/auth";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!hasSupabaseBrowserEnv()) {
    return <SetupNotice />;
  }

  try {
    await requireAdminUser();
  } catch {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
