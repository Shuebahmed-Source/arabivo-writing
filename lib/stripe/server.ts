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

/** Checkout + portal require secret key and a subscription price id. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_ID?.trim(),
  );
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
