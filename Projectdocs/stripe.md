# Stripe (subscriptions)

ArabivoWrite uses **Stripe Checkout** (subscription mode) and the **Customer Billing Portal**. Subscription state is stored in Supabase table **`user_subscriptions`** and updated from **webhooks**.

## Environment variables

See **`.env.example`**. Use this quick rule:

- **Minimum to show Subscribe + create Checkout session:** `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`
- **Required to keep subscription status synced in Supabase:** `STRIPE_WEBHOOK_SECRET`
- **Optional:** `NEXT_PUBLIC_APP_URL` (recommended in production)

Required/optional matrix:

| Variable | Notes |
|----------|--------|
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys — **Secret** key |
| `STRIPE_WEBHOOK_SECRET` | From the **webhook endpoint** you create (Signing secret) |
| `STRIPE_PRICE_ID` | **Recurring** Price id (e.g. `price_...`) for your product (required for checkout) |
| `NEXT_PUBLIC_APP_URL` | Optional — canonical `https://your-domain.com` for Checkout success/cancel and Portal return URLs; if omitted, the app uses request headers (works on Vercel) |

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
| `POST /api/checkout` | Authenticated — creates a Checkout Session, returns `{ url }` |
| `POST /api/billing-portal` | Authenticated — opens Billing Portal for the customer in `user_subscriptions` |
| `POST /api/webhooks/stripe` | Stripe-only — verifies signature, upserts `user_subscriptions` |

The **Dashboard** shows the subscription card when `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` are both set. If either is missing, the card is hidden (lessons still work).

## Common setup mistakes

- Using a **Product ID** (`prod_...`) instead of a **Price ID** (`price_...`) in `STRIPE_PRICE_ID`
- Creating a one-time price instead of a **recurring** price for subscription checkout
- Forgetting to set the same env vars in **Vercel Production** after testing locally
- Webhook created but missing one of the required events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)

## Paywall (future)

Lesson routes are **not** gated on subscription status yet. To require an active subscription, use **`isPaidSubscriptionStatus`** from **`lib/subscriptions/status.ts`** in server components or middleware together with **`fetchUserSubscriptionForCurrentUser`**.
