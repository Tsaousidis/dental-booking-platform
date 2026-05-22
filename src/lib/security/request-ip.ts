import "server-only";

export function getRequestIp(request: Request) {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const forwarded = headers
    .get("forwarded")
    ?.split(";")
    .find((part) => part.trim().toLowerCase().startsWith("for="))
    ?.split("=")[1]
    ?.replace(/^"|"$/g, "")
    .trim();

  return (
    headers.get("cf-connecting-ip") ??
    headers.get("true-client-ip") ??
    forwardedFor ??
    headers.get("x-real-ip") ??
    headers.get("x-client-ip") ??
    forwarded ??
    null
  );
}
