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
 * Upserts lifetime access from a one-time Checkout Session (payment mode).
 */
export async function syncLifetimeFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const clerkUserId =
    session.metadata?.clerk_user_id ?? session.client_reference_id ?? null;
  if (!clerkUserId) {
    console.error("[stripe] Missing clerk_user_id for lifetime checkout");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!customerId) {
    console.error("[stripe] Missing customer for lifetime checkout");
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      clerk_user_id: clerkUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: null,
      status: "lifetime",
      current_period_end: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" },
  );

  if (error) {
    console.error("[stripe sync lifetime]", error.message);
  }
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

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (existing?.status === "lifetime") {
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
