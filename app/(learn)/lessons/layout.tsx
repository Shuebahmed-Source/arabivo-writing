import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isPreviewOrLocalDevBypassServer } from "@/lib/env/dev-access";
import {
  isStripeConfigured,
  shouldEnforceSubscriptionAccess,
} from "@/lib/stripe/server";
import { hasSubscriptionAccessForCurrentUser } from "@/lib/subscriptions/access";

export const dynamic = "force-dynamic";

/**
 * Paid access: subscribe from landing + /subscribe. Lessons require active or
 * trialing Stripe subscription when billing is configured (else redirect /subscribe).
 */
export default async function LessonsPaywallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isPreviewOrLocalDevBypassServer()) {
    return children;
  }

  if (!isStripeConfigured() || !shouldEnforceSubscriptionAccess()) {
    return children;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const allowed = await hasSubscriptionAccessForCurrentUser();
  if (!allowed) {
    redirect("/subscribe");
  }

  return children;
}
