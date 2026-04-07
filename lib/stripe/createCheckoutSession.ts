import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { hasSubscriptionAccessForCurrentUser } from "@/lib/subscriptions/access";

import { resolveSubscriptionPriceId } from "./resolveSubscriptionPriceId";
import {
  getStripe,
  getStripePriceId,
  getStripeTrialPeriodDays,
  isPlausibleStripeSecretKey,
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

function buildSessionParams(opts: {
  priceId: string;
  origin: string;
  userId: string;
  email?: string;
  trialDays: number;
  includeTrial: boolean;
}): Stripe.Checkout.SessionCreateParams {
  const { priceId, origin, userId, email, trialDays, includeTrial } = opts;
  return {
    mode: "subscription",
    ...(email ? { customer_email: email } : {}),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/?checkout=canceled`,
    client_reference_id: userId,
    metadata: { clerk_user_id: userId },
    subscription_data: {
      metadata: { clerk_user_id: userId },
      ...(includeTrial && trialDays > 0
        ? { trial_period_days: trialDays }
        : {}),
    },
  };
}

export async function createCheckoutSessionUrlForCurrentUser(): Promise<CreateCheckoutSessionResult> {
  if (!isStripeConfigured()) {
    const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
    if (key && !isPlausibleStripeSecretKey(key)) {
      console.error(
        "[stripe] STRIPE_SECRET_KEY must be the Secret key (sk_live_... or sk_test_...) from Stripe → Developers → API keys — not Publishable (pk_) or other prefixes.",
      );
    }
    return { ok: false, error: "not_configured" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "unauthorized" };
  }

  const hasAccess = await hasSubscriptionAccessForCurrentUser();
  if (hasAccess) {
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
  const envPriceOrProduct = getStripePriceId();
  const resolved = await resolveSubscriptionPriceId(stripe, envPriceOrProduct);
  if (!resolved.ok) {
    console.error("[stripe] resolve price:", resolved.message);
    return { ok: false, error: "checkout_failed" };
  }
  const priceId = resolved.priceId;
  const trialDays = getStripeTrialPeriodDays();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(
      buildSessionParams({
        priceId,
        origin,
        userId,
        email,
        trialDays,
        includeTrial: true,
      }),
    );
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
