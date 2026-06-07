export const PAYWALL_HEADLINE = "You're ready — keep going";

export const PAYWALL_SUBHEAD =
  "You've tried the trace — unlock all lessons, progress tracking, and daily challenges.";

export const LIFETIME_BADGE = "Best value";

export const LIFETIME_HEADLINE = "Pay once, learn forever — £54";

export const LIFETIME_CTA = "Unlock forever — £54";

export const MONTHLY_PLAN_LABEL = "Monthly access";

export const MONTHLY_PRICE_LABEL = "£7.99";

export const MONTHLY_INTERVAL_LABEL = "month";

export const MONTHLY_CTA = "Subscribe monthly";

export const MONTHLY_LINK_LABEL =
  "Prefer monthly? £7.99/month — cancel anytime";

const MONTHLY_PRICE_GBP = 7.99;
const LIFETIME_PRICE_GBP = 54;
const MONTHLY_YEAR_COMPARE_GBP = MONTHLY_PRICE_GBP * 12;

function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Strikethrough anchor — 12 months of monthly billing. */
export const LIFETIME_COMPARE_PRICE = formatGbp(MONTHLY_YEAR_COMPARE_GBP);

export const LIFETIME_SAVINGS_LABEL = `Save ${Math.round(
  (1 - LIFETIME_PRICE_GBP / MONTHLY_YEAR_COMPARE_GBP) * 100,
)}%`;

export const LIFETIME_FEATURES = [
  "Full access to every handwriting lesson and unit",
  "Guided tracing canvas with clear feedback",
  "Progress saved to your account",
  "Daily challenge + streak",
  "Every lesson we add in the future",
  "No recurring charges",
] as const;

export const MONTHLY_FEATURES = [
  "Full access to every handwriting lesson and unit",
  "Guided tracing canvas with clear feedback",
  "Progress saved to your account",
  "Daily challenge + streak",
  "Every lesson we add in the future",
  "Cancel anytime from billing settings",
] as const;

export const PRICING_SECTION_HEADLINE = "Choose how you want to learn";

export const PRICING_SECTION_SUB =
  "Unlock the full course after your free trace.";

export const MARKETING_ACCESS_CTA = "Get full access";
