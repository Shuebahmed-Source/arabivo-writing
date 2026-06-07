# Stripe (lifetime + monthly)

ArabivoWrite uses **Stripe Checkout** for **lifetime** (one-time payment) and **monthly** (subscription) plans, plus the **Customer Billing Portal** for monthly subscribers. Access state is stored in Supabase table **`user_subscriptions`** and updated from **webhooks**.

When the paywall is active, paying users can access the **full** in-repo curriculum on **`/lessons`** (see **`Projectdocs/context.md`**). The **homepage daily challenge** (`/#challenge`), **`/daily`**, **`/try`**, and **`/onboarding`** are public. **After onboarding sign-up**, users go to **`/subscribe`** (side-by-side plan cards) before **`/lessons`**.

**Production:** Live billing and paywall rules apply on **Vercel** when **`VERCEL_ENV=production`** and Stripe env vars are set.

## Pricing (current)

| Plan | Price | Stripe mode |
|------|-------|-------------|
| **Lifetime** | £54 one-time | Checkout **`payment`** |
| **Monthly** | £7.99/month | Checkout **`subscription`** (no trial) |

**No free trial** on Checkout — the onboarding trace is the free taste.

**Grandfathering:** Existing subscribers on an older monthly price (e.g. £5.99) keep access via Stripe webhooks. New monthly checkouts use **`STRIPE_MONTHLY_PRICE_ID`** only.

## Environment variables

See **`.env.example`**.

| Variable | Notes |
|----------|--------|
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys — **Secret** key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from your webhook endpoint |
| `STRIPE_LIFETIME_PRICE_ID` | One-time Price id (`price_...`) — e.g. £54 lifetime |
| `STRIPE_MONTHLY_PRICE_ID` | Recurring monthly Price id (`price_...`) — e.g. £7.99/month, **no trial** |
| `NEXT_PUBLIC_APP_URL` | Optional — canonical production URL (`https://write.arabivo.net`) for Checkout return URLs on production. **Local dev:** return URLs use the request host (`localhost`) even when this is set — see **`resolveAppOrigin`** in **`lib/stripe/server.ts`**. |
| `FREE_ACCESS_EMAILS` | Optional — comma-separated allowlist with full access without Stripe |

Set the same values in **Vercel** → Production. Redeploy after changing env vars.

**Removed (legacy):** `STRIPE_PRICE_ID`, `STRIPE_TRIAL_PERIOD_DAYS`.

## Stripe Dashboard setup

1. **Lifetime price** — One-time **£54** → `STRIPE_LIFETIME_PRICE_ID`
2. **Monthly price** — Recurring **£7.99/month**, no trial → `STRIPE_MONTHLY_PRICE_ID`
3. **Customer portal** — [Settings → Billing → Customer portal](https://dashboard.stripe.com/settings/billing/portal) — for **monthly** subscribers only
4. **Webhook** — [Developers → Webhooks](https://dashboard.stripe.com/webhooks)  
   - **URL:** `https://write.arabivo.net/api/webhooks/stripe` (use your production host — **not** bare `arabivo.net` if it redirects)  
   - **Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

For **local webhook testing**, use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Database

Run **`supabase/migrations/20260405120000_user_subscriptions.sql`**.

| `status` value | Meaning |
|----------------|---------|
| `lifetime` | One-time purchase; `stripe_subscription_id` is null |
| `active` / `trialing` | Monthly subscription |
| (other Stripe values) | e.g. `canceled` — no access unless allowlisted |

Lifetime rows are never downgraded by subscription webhooks if the user later had a monthly sub (**`syncSubscriptionFromStripe`** skips when existing status is `lifetime`).

## App routes

| Route | Purpose |
|-------|---------|
| **`/subscribe`** | Signed-in paywall — side-by-side plan cards → Stripe Checkout |
| `POST /api/checkout` | Body `{ "plan": "lifetime" \| "monthly" }` — creates Checkout Session |
| `POST /api/billing-portal` | Authenticated **monthly** subscribers — Stripe Customer Portal |
| `POST /api/webhooks/stripe` | Verifies signature; upserts `user_subscriptions` |

Checkout **success** → **`/dashboard?checkout=success`**. **Cancel** → **`/?checkout=canceled`** (banner links to **`#pricing`**).

**Access:** `hasSubscriptionAccessForCurrentUser()` grants access for `active`, `trialing`, or **`lifetime`**, or **`FREE_ACCESS_EMAILS`**.

**Dashboard billing:** **`LearnSubscriptionCard`** — **Lifetime member** badge (no portal) for lifetime; **Manage billing** + renewal date for monthly.

## Paywall UI

Shared component **`PaywallOptions`** (`components/marketing/paywall-options.tsx`); copy in **`lib/marketing/paywall-copy.ts`**.

- **`/subscribe`** and landing **`#pricing`** mirror each other  
- **Layout:** two cards side by side on desktop — **monthly left** (smaller), **lifetime right** (hero, emerald tint, **Best value** tab)  
- **Mobile:** lifetime card stacks **first**, monthly below  
- **Lifetime card:** **£54** with ~~£95.88~~ strikethrough (12 × £7.99) and **Save 44%** badge; CTA **Unlock forever — £54**  
- **Monthly card:** **£7.99** / month; CTA **Subscribe monthly**  
- **Subscribe page headline:** “You're ready — keep going”  
- **Marketing header CTA:** **Get full access** (not trial copy)  
- **Hero** unchanged: **Let's go!** → **`/onboarding`**

## Vercel logs

Filter by route **`/api/checkout`** or **`/api/webhooks/stripe`** — not only **`/`**. Search for **`[stripe]`** on checkout failures.
