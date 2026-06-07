# Launch & billing checklist (operations)

Single reference for **production** setup touched during billing, paywall, Clerk, Stripe, Supabase, and Vercel domain work. Details live in linked docs.

**Deploy source:** Pushes to **`main`** trigger **Vercel Production** for the primary domain (e.g. **`write.arabivo.net`**). After each production deploy, run the **smoke tests** below on the **live** host—not only localhost.

## Product (current behaviour)

- **Pricing:** **Lifetime £54** (one-time) + **Monthly £7.99/month** — configured in **Stripe**; **`STRIPE_LIFETIME_PRICE_ID`** and **`STRIPE_MONTHLY_PRICE_ID`** in Vercel. **No free trial** on Checkout (onboarding trace is the free taste).  
- **Paywall UI:** **`/subscribe`** and **`/#pricing`** — side-by-side cards (monthly left, lifetime hero right); see **`stripe.md`**.  
- **Paywall (production only on Vercel):** When **`STRIPE_SECRET_KEY`**, **`STRIPE_LIFETIME_PRICE_ID`**, and **`STRIPE_MONTHLY_PRICE_ID`** are set **and** **`VERCEL_ENV=production`**, **`/lessons/*`** requires subscription access (**`lifetime`**, **`active`** / **`trialing`**, or **`FREE_ACCESS_EMAILS`**). **`/dashboard`** stays open. **`/`**, **`/try`**, **`/daily`**, **`/#challenge`**, and **`/onboarding`** stay public. Progress saves use the same rule when enforcement is on. **Vercel Preview** and local dev **skip** enforcement (**`shouldEnforceSubscriptionAccess()`**). If Stripe env is incomplete, lessons are not paywalled.  
- **Auth (production):** **`/dashboard`** and **`/lessons`** require Clerk sign-in via **`proxy.ts`**. **`/`**, **`/try`**, and **`/daily`** do not. **Preview / local dev** can bypass **`auth.protect()`** for learn routes (**`lib/env/dev-access.ts`**) for testing.  
- **Daily challenge:** one word per **UTC day** on **`/#challenge`**, **`/try`**, **`/daily`**; signed-in streak in **`user_daily_challenge`**.  
- **Auth pages:** **`/sign-in`** and **`/sign-up`** are never paywalled.

## Vercel — project env (Production)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production publishable key |
| `CLERK_SECRET_KEY` | Clerk secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` (if used) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` (if used) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | e.g. `/lessons` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | e.g. `/lessons` |
| `NEXT_PUBLIC_APP_URL` | `https://write.arabivo.net` — Stripe return URLs on production |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_LIFETIME_PRICE_ID` | One-time Price id (`price_...`) — £54 lifetime |
| `STRIPE_MONTHLY_PRICE_ID` | Recurring monthly Price id (`price_...`) — £7.99/month |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional — PostHog project token (`phc_…`) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional — e.g. `https://eu.i.posthog.com` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | Optional — Clerk path FAPI proxy |
| `FREE_ACCESS_EMAILS` | Optional — complimentary full access |

Redeploy after any env change. **Remove** legacy `STRIPE_PRICE_ID` and `STRIPE_TRIAL_PERIOD_DAYS` if still present.

## Vercel — Preview (branch / PR deploys)

- Copy Production Stripe/Clerk/Supabase keys if you want Checkout on preview URLs. For lesson UI smoke tests without billing, Preview can use **paywall + learn-route auth bypasses** (see **`features.md`**).  
- **`VERCEL_ENV`** is **`preview`** on Preview deployments.

## Vercel / registrar — domain DNS

- **`write.arabivo.net`** must resolve to your deployment. Stripe webhook URL must use the **same host** that serves the app (e.g. **`https://write.arabivo.net/api/webhooks/stripe`**).

## Clerk — production instance

See **`Projectdocs/clerk-production.md`**.

## Stripe

- **Lifetime** + **monthly** Prices created; env vars set on Vercel.  
- **Customer portal** enabled (monthly subscribers).  
- **Webhook** `POST https://write.arabivo.net/api/webhooks/stripe` with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.  
- See **`Projectdocs/stripe.md`**.

## Supabase

- Run **`20260403120000_user_progress.sql`**, **`20260405120000_user_subscriptions.sql`**, **`20260530120000_user_onboarding.sql`**, and **`20260606120000_user_daily_challenge.sql`**.  
- See **`Projectdocs/supabase-production.md`**.

## Smoke tests before “released” (production host)

1. **`/sign-in`** — Clerk works.  
2. **`/#challenge`** or **`/daily`** — trace today’s word to **~88%+** without sign-in.  
3. **Daily streak (signed in)** — **`/daily`** → **`user_daily_challenge`** row; dashboard **Daily challenge** card.  
4. **Onboarding** — **Let's go!** → questions → trace **س** → sign-up → **`/subscribe`**.  
5. **`/subscribe`** — two plan cards (monthly left, lifetime hero right); **Unlock forever — £54** opens Stripe **£54** payment.  
6. **Monthly plan** — **Subscribe monthly** opens **£7.99/month** subscription (no trial).  
7. Signed in **without** access — **`/lessons`** → **`/subscribe`**.  
8. After Checkout + webhook — **`user_subscriptions`** row (`lifetime` or `active`); **`/lessons`** loads.  
9. **Dashboard billing** — lifetime shows **Lifetime member**; monthly shows **Manage billing** portal.  
10. Complete a lesson — **`user_progress`** row.  
11. **Replay / progression** — **Next** in a completed section follows lesson order.  
12. **Curriculum breadth** — four unit cards on dashboard; seven simple-word sections; eight challenge items.  
13. **Cancel checkout** — returns to **`/?checkout=canceled`** on **production host** with new paywall still on **`#pricing`**.  
14. **PostHog (optional)** — **`$pageview`**, **`checkout_started`**, **`checkout_completed`**.

## After a production deploy

- Watch **Vercel → Logs** for **`[stripe]`** and **`[user_progress]`** lines.  
- Confirm **Clerk** and **Stripe** dashboards show traffic from **`write.arabivo.net`**.

## Related docs

- **`stripe.md`** — API routes, paywall UI, env vars  
- **`clerk-production.md`**, **`supabase-production.md`**, **`database.md`**, **`features.md`**, **`userflow.md`**, **`context.md`**, **`github.md`**
