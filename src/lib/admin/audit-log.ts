import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type AuditLogInput = {
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAdminAuditLog({
  adminEmail,
  action,
  entityType,
  entityId = null,
  metadata = {},
}: AuditLogInput) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("admin_audit_logs").insert({
    admin_email: adminEmail,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });

  if (error && process.env.NODE_ENV === "production") {
    throw new Error(error.message);
  }
}
