export type CheckoutPlan = "lifetime" | "monthly";

export function isCheckoutPlan(value: unknown): value is CheckoutPlan {
  return value === "lifetime" || value === "monthly";
}
