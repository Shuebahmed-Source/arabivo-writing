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
