import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SubscribeBridge } from "@/components/marketing/subscribe-bridge";
import { hasSubscriptionAccessForCurrentUser } from "@/lib/subscriptions/access";
import { getSubscriptionPriceDisplay } from "@/lib/stripe/getSubscriptionPriceDisplay";
import { getStripeTrialPeriodDays, isStripeConfigured } from "@/lib/stripe/server";

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

  const trialDays = getStripeTrialPeriodDays();

  if (!isStripeConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted-foreground">
        Subscription checkout is not available yet. Please try again later.
      </div>
    );
  }

  const price = await getSubscriptionPriceDisplay();

  return (
    <SubscribeBridge
      trialDays={trialDays}
      priceFormatted={price?.formatted ?? null}
      priceInterval={price?.interval ?? null}
      productName={price?.productName ?? null}
    />
  );
}
