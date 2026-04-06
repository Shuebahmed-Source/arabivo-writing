import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isStripeConfigured } from "@/lib/stripe/server";
import { fetchUserSubscriptionForCurrentUser } from "@/lib/subscriptions/queries";
import { isPaidSubscriptionStatus } from "@/lib/subscriptions/status";

export const dynamic = "force-dynamic";

/**
 * Paid access: /dashboard stays open (subscribe / manage billing). Lessons require
 * active or trialing Stripe subscription when billing is configured.
 */
export default async function LessonsPaywallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isStripeConfigured()) {
    return children;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const sub = await fetchUserSubscriptionForCurrentUser();
  if (!isPaidSubscriptionStatus(sub?.status)) {
    redirect("/dashboard?subscribe=required");
  }

  return children;
}
