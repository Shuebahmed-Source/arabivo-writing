/**
 * Validates an internal path for use as post-auth redirect (e.g. Clerk `forceRedirectUrl`).
 * Rejects open redirects and odd encodings.
 */
export function safeInternalRedirectPath(
  raw: string | string[] | undefined,
): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  if (!t.startsWith("/") || t.startsWith("//")) {
    return null;
  }
  if (t.includes("..") || t.includes("\\")) {
    return null;
  }
  if (t.includes(":")) {
    return null;
  }
  return t;
}
