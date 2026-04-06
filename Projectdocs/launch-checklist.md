# Launch & billing checklist (operations)

Single reference for **production** setup touched during billing, paywall, Clerk, Stripe, Supabase, and Vercel domain work. Details live in linked docs.

## Product (current behaviour)

- **Price:** £5.99/month (or your Stripe Price) — configured in **Stripe**; **`STRIPE_PRICE_ID`** in Vercel points at that recurring Price.  
- **Optional trial:** Set **`STRIPE_TRIAL_PERIOD_DAYS=3`** (or `0` / omit for no trial). Trial is applied in **Checkout** (`subscription_data.trial_period_days`); you do **not** need a separate “trial product” in Stripe.  
- **Paywall:** When **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are both set, **`/lessons/*`** requires Stripe subscription **`active`** or **`trialing`**. **`/dashboard`** stays open for **Subscribe** / **Manage billing**. Progress saves (`recordLessonCompletion`) use the same rule. If Stripe env is incomplete, lessons stay **unlocked** (billing treated as off).  
- **Auth:** **`/sign-in`** and **`/sign-up`** are never paywalled.

## Vercel — project env (Production)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production publishable key |
| `CLERK_SECRET_KEY` | Clerk secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` (if used) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` (if used) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | e.g. `/lessons` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | e.g. `/lessons` |
| `NEXT_PUBLIC_APP_URL` | `https://write.arabivo.net` (or your host) — Stripe return URLs, clarity |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_ID` | Recurring Price id (`price_...`) |
| `STRIPE_TRIAL_PERIOD_DAYS` | Optional, e.g. `3` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | Optional — only if using Clerk **path** FAPI proxy (`https://your-host/__clerk/`) |

Redeploy after any env change.

## Vercel / registrar — domain DNS

- **`write.arabivo.net`** must resolve to your deployment: add the **subdomain** in **Vercel → Project → Domains**, then add the **CNAME** (or record) Vercel shows under **Vercel Domains** for **`arabivo.net`**. DNS records are **not** environment variables.  
- Domains bought **through Vercel** still need **`write`** (or full host) records as instructed when you attach the hostname to the project.

## Clerk — production instance

1. **Domains** — Production DNS for **`write.arabivo.net`** and Clerk subdomains (**`clerk.write`**, **`accounts.write`**, email/DKIM if used) until Clerk shows **Verified** and SSL **Issued**.  
2. **Google / social sign-in** — Production needs **your own** OAuth client (e.g. Google Cloud Console) and redirect URIs exactly as Clerk lists; shared dev credentials are not enough.  
3. **CSP / CORS on `clerk.*`:** **`proxy.ts`** enables **`contentSecurityPolicy: {}`** on `clerkMiddleware` so Clerk’s script host is allowed. If **`clerk.write.arabivo.net`** still fails, see **`clerk-production.md`** (path proxy **`NEXT_PUBLIC_CLERK_PROXY_URL`** optional).  
4. See **`Projectdocs/clerk-production.md`** for blank sign-in, VPN, and troubleshooting.

## Stripe

- **Customer portal** enabled in Stripe Dashboard.  
- **Webhook** `POST https://<your-domain>/api/webhooks/stripe` with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.  
- See **`Projectdocs/stripe.md`**.

## Supabase

- Run **`20260403120000_user_progress.sql`** and **`20260405120000_user_subscriptions.sql`** on the production database (SQL Editor).  
- See **`Projectdocs/supabase-production.md`**.

## Smoke tests before “released”

1. Open **`https://<host>/sign-in`** — Clerk form loads; Google (or email) works.  
2. Signed in **without** subscription — **`/lessons`** redirects to **`/subscribe`** (then into Stripe Checkout).  
3. From **`/`** pricing — **Start free trial** / **Subscribe** → auth → **`/subscribe`** → Checkout completes; webhook writes **`user_subscriptions`**; **`/lessons`** loads.  
4. Complete a lesson — row in **`user_progress`**.  
5. **Manage billing** — from dashboard **Billing** card (subscribers only) — Stripe Customer Portal opens.

## Related docs

- **`stripe.md`** — API routes, paywall behaviour, trial env  
- **`clerk-production.md`** — Clerk DNS, CSP, proxy, console checks  
- **`supabase-production.md`** — migrations and Supabase env  
- **`database.md`** — `user_progress`, `user_subscriptions`  
- **`features.md`**, **`userflow.md`**, **`techstack.md`**, **`todo.md`**
