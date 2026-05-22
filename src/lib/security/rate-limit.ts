import "server-only";

import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestIp } from "./request-ip";

type RateLimitOptions = {
  route: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

export async function checkRateLimit({
  route,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions) {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const normalizedIdentifier = identifier.trim() || "missing-identifier";
  const identifierHash = hashIdentifier(normalizedIdentifier);
  const retryAfter = Math.ceil(
    (windowStart.getTime() + windowMs - Date.now()) / 1000,
  );

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("api_rate_limits")
    .select("id,request_count")
    .eq("route", route)
    .eq("identifier_hash", identifierHash)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  if (error) {
    return {
      allowed: process.env.NODE_ENV !== "production",
      retryAfter,
      skipped: true,
    };
  }

  if (!data) {
    const { error: insertError } = await supabase.from("api_rate_limits").insert({
      route,
      identifier_hash: identifierHash,
      window_start: windowStart.toISOString(),
      request_count: 1,
    });

    return { allowed: !insertError, retryAfter, skipped: Boolean(insertError) };
  }

  if (data.request_count >= limit) {
    return { allowed: false, retryAfter, skipped: false };
  }

  const { error: updateError } = await supabase
    .from("api_rate_limits")
    .update({ request_count: data.request_count + 1 })
    .eq("id", data.id);

  return { allowed: !updateError, retryAfter, skipped: Boolean(updateError) };
}

export function getRequestIdentifier(request: Request, fallback = "missing") {
  const candidate = getRequestIp(request);

  if (candidate) {
    return `ip:${candidate}`;
  }

  return `fallback:${fallback}`;
}

function hashIdentifier(identifier: string) {
  return createHash("sha256").update(identifier).digest("hex");
}
