# Stripe (subscriptions)

ArabivoWrite uses **Stripe Checkout** (subscription mode) and the **Customer Billing Portal**. Subscription state is stored in Supabase table **`user_subscriptions`** and updated from **webhooks**.

When the paywall is active, subscribers can access the **full** in-repo curriculum on **`/lessons`** (currently **79** handwriting lessons across letters, letter forms, themed simple words, and challenge words — see **`Projectdocs/context.md`**). The **homepage daily challenge** (`/#challenge`), **`/daily`**, **`/try`**, and **`/onboarding`** (pre-sign-up steps) are public and do not require a subscription. **After onboarding sign-up**, users go to **`/subscribe`** before **`/lessons`**.

**Production:** Live billing and paywall rules apply on **Vercel** when **`VERCEL_ENV=production`** and Stripe env vars are set — same code path users get from **`main`**.

## Environment variables

See **`.env.example`**. Use this quick rule:

- **Minimum to show Subscribe + create Checkout session:** `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`
- **Required to keep subscription status synced in Supabase:** `STRIPE_WEBHOOK_SECRET`
- **Optional:** `NEXT_PUBLIC_APP_URL` (recommended in production)

Required/optional matrix:

| Variable | Notes |
|----------|--------|
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys — **Secret** key (**`sk_live_...`** or **`sk_test_...`** only; not Publishable **`pk_`**) |
| `STRIPE_WEBHOOK_SECRET` | From the **webhook endpoint** you create (Signing secret) |
| `STRIPE_PRICE_ID` | **Recurring** Price id **`price_...`** (recommended), **or** Product id **`prod_...`** (app uses that product’s **default price** via Stripe API) |
| `NEXT_PUBLIC_APP_URL` | Optional — canonical `https://your-domain.com` for Checkout success/cancel and Portal return URLs; if omitted, the app uses request headers (works on Vercel) |
| `STRIPE_TRIAL_PERIOD_DAYS` | Optional — e.g. `7` for a 7-day trial on new Checkout subscriptions. Omit or `0` for no trial. Applied in **`lib/stripe/createCheckoutSession.ts`** (`subscription_data.trial_period_days`). You do **not** have to duplicate a trial on the Stripe Price unless you prefer configuring it only in the Dashboard (then leave this unset to avoid conflicting rules). |
| `FREE_ACCESS_EMAILS` | Optional — comma-separated allowlist (e.g. `a@x.com, b@y.com`). After sign-in, if **any** Clerk email on the user matches (trim + lowercase), they get the same access as **active/trialing** Stripe subscribers: lessons, progress saves, `/subscribe` and Checkout treat them as already entitled. Implemented in **`lib/subscriptions/access.ts`**. |

Set the same values in **Vercel** → Production (and Preview if you test billing there). Redeploy after changing env vars.

## Stripe Dashboard setup

1. **Product + Price** — Create a **recurring** price (monthly/yearly). Copy the **Price ID** into `STRIPE_PRICE_ID`.
2. **Customer portal** — [Settings → Billing → Customer portal](https://dashboard.stripe.com/settings/billing/portal) — enable so **Manage billing** works.
3. **Webhook** — [Developers → Webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**  
   - **URL:** `https://<your-production-domain>/api/webhooks/stripe`  
   - **Events to send:**  
     - `checkout.session.completed`  
     - `customer.subscription.updated`  
     - `customer.subscription.deleted`  
   - Copy the endpoint **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

For **local webhook testing**, use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the CLI’s webhook signing secret in `.env.local`.

## Database

Run the migration **`supabase/migrations/20260405120000_user_subscriptions.sql`** on your Supabase project (SQL Editor), same as other migrations.

## App routes

| Route | Purpose |
|-------|---------|
| **`/subscribe`** | Public URL — if signed in, creates a Checkout Session and redirects to Stripe; if signed out, redirects to sign-in with return to `/subscribe`. If already subscribed (Stripe **or** `FREE_ACCESS_EMAILS`), redirects to **`/lessons`**. |
| `POST /api/checkout` | Authenticated — creates a Checkout Session (same logic as `/subscribe`), returns `{ url }` |
| `POST /api/billing-portal` | Authenticated — opens Billing Portal for the customer in `user_subscriptions` |
| `POST /api/webhooks/stripe` | Stripe-only — verifies signature, upserts `user_subscriptions` |

Checkout **success** returns to **`/dashboard?checkout=success`**. **Cancel** returns to **`/?checkout=canceled`** (no `#` fragment so the page does not auto-scroll past the top banner). **Failed session creation** redirects to **`/?checkout=failed`** for the same reason.

The **landing page** (`/`, sections **`#challenge`**, **`#features`**, and **`#pricing`**) is the main place to start a subscription (CTAs go through Clerk, then **`/subscribe`** → Stripe). **`/daily`**, **`/try`**, and **`#challenge`** (today’s word trace) are public. The **dashboard** shows a **Daily challenge** card plus **Billing** **only for active/trialing subscribers** (manage portal). If either Stripe env key/price is missing, that card is hidden and **lessons are not paywalled** (Stripe treated as off).

When Stripe **is** configured **and** **`shouldEnforceSubscriptionAccess()`** is true (**`VERCEL_ENV=production`** on Vercel; non-Vercel production uses **`NODE_ENV`** — see **`lib/stripe/server.ts`**), **`/lessons`** (and nested lesson/section routes) require **`hasSubscriptionAccessForCurrentUser()`** (`lib/subscriptions/access.ts`): either **`FREE_ACCESS_EMAILS`** or **`active`** / **`trialing`** in **`user_subscriptions`**. Otherwise redirect to **`/subscribe`**. Progress saves enforce the same rule when enforcement is on. **`/`**, **`/try`**, **`/daily`**, and the **`/#challenge`** daily trace are **not** paywalled. **Vercel Preview** and local dev **skip** subscription enforcement. **`POST /api/checkout`** still refuses Checkout if access is already granted (including free-email allowlist).

## Vercel logs (why you might see “nothing”)

Deployment **Logs** only show requests that hit that deployment. If the **Route** filter is set to **`/`**, you will only see homepage hits—**not** `/subscribe` or `/api/checkout`. Clear the route filter, widen the time range, then open **`/subscribe`** and click through to Stripe to generate entries. Server `console.error` lines (e.g. **`[stripe]`**) appear in those logs.

## Checkout failed (500 on `/subscribe`)

`/subscribe` calls **`stripe.checkout.sessions.create`**. If Stripe rejects the request (bad **Price ID**, test/live key mismatch, invalid trial, etc.), the SDK throws. The app now catches that, logs **`[stripe] checkout.sessions.create`** with **type**, **code**, and **message**, and redirects to **`/?checkout=failed`** instead of a blank error page.

**Where to look:** Vercel → your project → **Logs** (or **Runtime Logs** / **Functions** for the Serverless invocation). Search for **`[stripe] checkout`**.

## Common setup mistakes

- Using a **Product ID** (`prod_...`) instead of a **Price ID** (`price_...`) in `STRIPE_PRICE_ID`. On the product page, open the **£/month price row** (or API) to copy the id that starts with **`price_`**. You do **not** need a separate product for a free trial: set **`STRIPE_TRIAL_PERIOD_DAYS`** (e.g. `7`) in env and the app passes **`trial_period_days`** at Checkout—unless you also put a trial on the Price in Stripe Dashboard, which can conflict; prefer **one** source (env **or** Dashboard).
- Creating a one-time price instead of a **recurring** price for subscription checkout
- Forgetting to set the same env vars in **Vercel Production** after testing locally
- Webhook created but missing one of the required events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)

## Paywall

**Access logic** lives in **`lib/subscriptions/access.ts`**: **`hasSubscriptionAccessForCurrentUser()`** — **`FREE_ACCESS_EMAILS`** or paid status via **`fetchUserSubscriptionForCurrentUser`**. **Enforcement** on lesson routes and saves is wrapped with **`shouldEnforceSubscriptionAccess()`** (**`lib/stripe/server.ts`**) in **`app/(learn)/lessons/layout.tsx`** and **`app/actions/progress.ts`**. **`/subscribe`** and **`createCheckoutSession`** use access checks without that gate (unchanged). Preview/local: see **`Projectdocs/features.md`**.
