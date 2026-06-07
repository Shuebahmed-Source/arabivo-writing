import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PaywallOptions } from "@/components/marketing/paywall-options";
import { hasSubscriptionAccessForCurrentUser } from "@/lib/subscriptions/access";
import { isStripeConfigured } from "@/lib/stripe/server";

export const metadata: Metadata = {
  title: "Subscribe",
};

export default async function SubscribePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/subscribe");
  }

  const hasAccess = await hasSubscriptionAccessForCurrentUser();
  if (hasAccess) {
    redirect("/lessons");
  }

  if (!isStripeConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted-foreground">
        Subscription checkout is not available yet. Please try again later.
      </div>
    );
  }

  return <PaywallOptions variant="subscribe" initialSignedIn={true} />;
}
