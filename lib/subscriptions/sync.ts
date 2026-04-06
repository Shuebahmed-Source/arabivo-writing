import type Stripe from "stripe";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Stripe API types expose period end on subscription items (or legacy top-level field). */
function getCurrentPeriodEndUnix(
  subscription: Stripe.Subscription,
): number | null {
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  if (typeof fromItem === "number") {
    return fromItem;
  }
  const legacy = (subscription as { current_period_end?: number })
    .current_period_end;
  return typeof legacy === "number" ? legacy : null;
}

/**
 * Upserts subscription state from a Stripe Subscription object (webhooks / checkout complete).
 */
export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackClerkUserId?: string | null,
): Promise<void> {
  const clerkUserId =
    subscription.metadata?.clerk_user_id ?? fallbackClerkUserId ?? null;
  if (!clerkUserId) {
    console.error("[stripe] Missing clerk_user_id in subscription metadata");
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const periodEndUnix = getCurrentPeriodEndUnix(subscription);
  const periodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      clerk_user_id: clerkUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" },
  );

  if (error) {
    console.error("[stripe sync]", error.message);
  }
}
