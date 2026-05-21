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

  let user;

  try {
    user = await requireAdminUser();
  } catch {
    redirect("/admin/login");
  }

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
