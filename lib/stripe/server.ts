import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

/** Stripe standard secret keys are sk_live_... or sk_test_... (Dashboard → API keys). */
export function isPlausibleStripeSecretKey(key: string): boolean {
  return /^sk_(live|test)_/.test(key.trim());
}

/** Checkout + portal require a valid-format secret key and STRIPE_PRICE_ID (price_ or prod_). */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const price = process.env.STRIPE_PRICE_ID?.trim() ?? "";
  return Boolean(key && price && isPlausibleStripeSecretKey(key));
}

/**
 * Enforce subscription paywall only in production.
 * - Vercel: enforce only when VERCEL_ENV=production (skip preview).
 * - Local/dev: skip (including localhost).
 */
export function shouldEnforceSubscriptionAccess(): boolean {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnv) {
    return vercelEnv === "production";
  }
  return process.env.NODE_ENV === "production";
}

export function getStripePriceId(): string {
  const id = process.env.STRIPE_PRICE_ID?.trim();
  if (!id) {
    throw new Error("Missing STRIPE_PRICE_ID");
  }
  return id;
}

/**
 * Free trial length for new subscriptions created via Checkout.
 * Set `STRIPE_TRIAL_PERIOD_DAYS=3` on Vercel; omit or `0` for no trial.
 * Avoid duplicating a trial on the Stripe Price unless you intend to stack behavior — prefer one place (here or Dashboard).
 */
export function getStripeTrialPeriodDays(): number {
  const raw = process.env.STRIPE_TRIAL_PERIOD_DAYS?.trim();
  if (!raw) {
    return 0;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > 365) {
    return 0;
  }
  return n;
}
