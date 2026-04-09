import { headers } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Development / preview only: relax Clerk auth and lesson unlock gates.
 * Production (VERCEL_ENV=production on Vercel, or any hosted deploy with NODE_ENV=production
 * and non-local host) keeps full enforcement.
 */

function isLocalHostname(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "::1"
  );
}

/** Middleware / Edge: pass the incoming request. */
export function isPreviewOrLocalDevBypassFromRequest(req: NextRequest): boolean {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnv === "preview") return true;
  if (process.env.NODE_ENV === "development") return true;
  if (!vercelEnv && isLocalHostname(req.nextUrl.hostname)) return true;
  return false;
}

/** Server Components / Server Actions: uses request Host when not on Vercel. */
export async function isPreviewOrLocalDevBypassServer(): Promise<boolean> {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnv === "preview") return true;
  if (process.env.NODE_ENV === "development") return true;
  if (!vercelEnv) {
    const h = await headers();
    if (isLocalHostname(h.get("host"))) return true;
  }
  return false;
}
