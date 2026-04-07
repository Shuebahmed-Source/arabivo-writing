import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { fetchUserSubscriptionForCurrentUser } from "@/lib/subscriptions/queries";
import { isPaidSubscriptionStatus } from "@/lib/subscriptions/status";

import {
  getStripe,
  getStripePriceId,
  getStripeTrialPeriodDays,
  isStripeConfigured,
} from "./server";

export type CreateCheckoutSessionResult =
  | { ok: true; url: string }
  | {
      ok: false;
      error:
        | "unauthorized"
        | "not_configured"
        | "no_url"
        | "already_subscribed"
        | "checkout_failed";
    };

export async function createCheckoutSessionUrlForCurrentUser(): Promise<CreateCheckoutSessionResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "unauthorized" };
  }

  const existing = await fetchUserSubscriptionForCurrentUser();
  if (isPaidSubscriptionStatus(existing?.status)) {
    return { ok: false, error: "already_subscribed" };
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = envOrigin || `${proto}://${host}`;

  const stripe = getStripe();
  const priceId = getStripePriceId();
  const trialDays = getStripeTrialPeriodDays();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(email ? { customer_email: email } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/?checkout=canceled#pricing`,
      client_reference_id: userId,
      metadata: { clerk_user_id: userId },
      subscription_data: {
        metadata: { clerk_user_id: userId },
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
      },
    });
  } catch (e) {
    if (e instanceof Stripe.errors.StripeError) {
      console.error(
        "[stripe] checkout.sessions.create",
        e.type,
        e.code ?? "",
        e.message,
      );
    } else {
      console.error("[stripe] checkout.sessions.create", e);
    }
    return { ok: false, error: "checkout_failed" };
  }

  if (!session.url) {
    return { ok: false, error: "no_url" };
  }

  return { ok: true, url: session.url };
}
