import type Stripe from "stripe";

/**
 * `STRIPE_PRICE_ID` may be a recurring `price_...` or a `prod_...` id (uses that
 * product’s default price — same as Stripe Checkout picking the product’s default).
 */
export async function resolveSubscriptionPriceId(
  stripe: Stripe,
  envValue: string,
): Promise<{ ok: true; priceId: string } | { ok: false; message: string }> {
  const v = envValue.trim();
  if (v.startsWith("price_")) {
    return { ok: true, priceId: v };
  }
  if (v.startsWith("prod_")) {
    try {
      const product = await stripe.products.retrieve(v, {
        expand: ["default_price"],
      });
      const dp = product.default_price;
      if (dp == null) {
        return {
          ok: false,
          message:
            "Product has no default price. In Stripe → Products, set a default price or set STRIPE_PRICE_ID to a price_... id.",
        };
      }
      const id = typeof dp === "string" ? dp : dp.id;
      return { ok: true, priceId: id };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Could not load product ${v}: ${msg}`,
      };
    }
  }
  return {
    ok: false,
    message:
      "STRIPE_PRICE_ID must start with price_ or prod_ (see Stripe Dashboard → Products).",
  };
}
