import { getStripe, getStripePriceId, isStripeConfigured } from "@/lib/stripe/server";

import { resolveSubscriptionPriceId } from "./resolveSubscriptionPriceId";

export type PriceDisplay = {
  /** e.g. "£5.99" */
  formatted: string;
  /** e.g. "month" */
  interval: string | null;
  /** Product name from Stripe, if available */
  productName: string | null;
};

/**
 * Loads the recurring price behind STRIPE_PRICE_ID for display on /subscribe.
 */
export async function getSubscriptionPriceDisplay(): Promise<PriceDisplay | null> {
  if (!isStripeConfigured()) {
    return null;
  }

  const stripe = getStripe();
  const raw = getStripePriceId();
  const resolved = await resolveSubscriptionPriceId(stripe, raw);
  if (!resolved.ok) {
    return null;
  }

  const price = await stripe.prices.retrieve(resolved.priceId, {
    expand: ["product"],
  });

  const unit = price.unit_amount;
  const currency = price.currency ?? "gbp";
  if (unit == null) {
    return null;
  }

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(unit / 100);

  const interval = price.recurring?.interval ?? null;

  let productName: string | null = null;
  const p = price.product;
  if (typeof p === "object" && p && !("deleted" in p && p.deleted)) {
    productName = "name" in p ? (p.name as string) : null;
  }

  return { formatted, interval, productName };
}
