import { auth, currentUser } from "@clerk/nextjs/server";

import { fetchUserSubscriptionForCurrentUser } from "@/lib/subscriptions/queries";
import { isPaidSubscriptionStatus } from "@/lib/subscriptions/status";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function freeAccessEmailSet(): Set<string> {
  const raw = process.env.FREE_ACCESS_EMAILS?.trim();
  if (!raw) {
    return new Set();
  }
  const parts = raw.split(",").map((s) => normalizeEmail(s)).filter(Boolean);
  return new Set(parts);
}

export function isEmailInFreeAccessAllowlist(
  email: string | null | undefined,
): boolean {
  if (!email) {
    return false;
  }
  return freeAccessEmailSet().has(normalizeEmail(email));
}

/**
 * Complimentary access via FREE_ACCESS_EMAILS (any verified Clerk email on the user).
 */
export async function isFreeAccessForCurrentUser(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }
  const allow = freeAccessEmailSet();
  if (allow.size === 0) {
    return false;
  }
  const user = await currentUser();
  if (!user) {
    return false;
  }
  for (const ea of user.emailAddresses ?? []) {
    if (allow.has(normalizeEmail(ea.emailAddress))) {
      return true;
    }
  }
  return false;
}

/**
 * Full product access: Stripe active/trialing OR FREE_ACCESS_EMAILS match.
 */
export async function hasSubscriptionAccessForCurrentUser(): Promise<boolean> {
  if (await isFreeAccessForCurrentUser()) {
    return true;
  }
  const sub = await fetchUserSubscriptionForCurrentUser();
  return isPaidSubscriptionStatus(sub?.status);
}
