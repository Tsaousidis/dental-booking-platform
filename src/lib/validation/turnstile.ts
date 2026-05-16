import "server-only";

type TurnstileResponse = {
  success: boolean;
};

export async function verifyTurnstileToken(token: string | undefined, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, skipped: false };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  if (ip) {
    formData.append("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as TurnstileResponse | null;

  return {
    ok: Boolean(payload?.success),
    skipped: false,
  };
}
