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

/** Checkout + portal require secret key and both price IDs. */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const lifetime = process.env.STRIPE_LIFETIME_PRICE_ID?.trim() ?? "";
  const monthly = process.env.STRIPE_MONTHLY_PRICE_ID?.trim() ?? "";
  return Boolean(
    key && lifetime && monthly && isPlausibleStripeSecretKey(key),
  );
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

export function getStripeLifetimePriceId(): string {
  const id = process.env.STRIPE_LIFETIME_PRICE_ID?.trim();
  if (!id) {
    throw new Error("Missing STRIPE_LIFETIME_PRICE_ID");
  }
  return id;
}

export function getStripeMonthlyPriceId(): string {
  const id = process.env.STRIPE_MONTHLY_PRICE_ID?.trim();
  if (!id) {
    throw new Error("Missing STRIPE_MONTHLY_PRICE_ID");
  }
  return id;
}

/** True when the incoming request is from local/LAN dev (not production host). */
export function isLocalDevHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

/**
 * Stripe return URLs: use the request origin on localhost/LAN so cancel/success
 * stay on your dev server even when NEXT_PUBLIC_APP_URL points at production.
 */
export function resolveAppOrigin(host: string, proto: string): string {
  const requestOrigin = `${proto}://${host}`;
  if (isLocalDevHost(host)) {
    return requestOrigin;
  }
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return envOrigin || requestOrigin;
}
