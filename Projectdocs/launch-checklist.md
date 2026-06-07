# Launch & billing checklist (operations)

Single reference for **production** setup touched during billing, paywall, Clerk, Stripe, Supabase, and Vercel domain work. Details live in linked docs.

**Deploy source:** Pushes to **`main`** trigger **Vercel Production** for the primary domain (e.g. **`write.arabivo.net`**). After each production deploy, run the **smoke tests** below on the **live** host—not only localhost.

## Product (current behaviour)

- **Price:** £5.99/month (or your Stripe Price) — configured in **Stripe**; **`STRIPE_PRICE_ID`** in Vercel points at that recurring Price.  
- **Optional trial:** Set **`STRIPE_TRIAL_PERIOD_DAYS=7`** (or `0` / omit for no trial). Trial is applied in **Checkout** (`subscription_data.trial_period_days`); you do **not** need a separate “trial product” in Stripe.  
- **Paywall (production only on Vercel):** When **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are both set **and** **`VERCEL_ENV=production`**, **`/lessons/*`** requires subscription access (**`active`** / **`trialing`** or **`FREE_ACCESS_EMAILS`**). **`/dashboard`** stays open for **Subscribe** / **Manage billing** and the **Daily challenge** card. **`/`**, **`/try`**, **`/daily`**, **`/#challenge`**, and **`/onboarding`** (signed-out welcome/questions/trace/projection) stay public. Progress saves use the same rule when enforcement is on. **Vercel Preview** and local dev **skip** this enforcement (**`shouldEnforceSubscriptionAccess()`**). If Stripe env is incomplete, lessons are not paywalled.  
- **Auth (production):** **`/dashboard`** and **`/lessons`** require Clerk sign-in via **`proxy.ts`**. **`/`**, **`/try`**, and **`/daily`** do not. **Preview / local dev** can bypass **`auth.protect()`** for learn routes (**`lib/env/dev-access.ts`**) for testing.  
- **Daily challenge:** one word per **UTC day** on **`/#challenge`**, **`/try`**, **`/daily`**; signed-in streak in **`user_daily_challenge`** (separate from lesson progress).  
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
| `NEXT_PUBLIC_APP_URL` | `https://write.arabivo.net` (or your host) — Stripe return URLs, clarity |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_ID` | Recurring Price id (`price_...`) |
| `STRIPE_TRIAL_PERIOD_DAYS` | Optional, e.g. `7` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional — PostHog project token (`phc_…`) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional — e.g. `https://eu.i.posthog.com` (match project region) |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | Optional — only if using Clerk **path** FAPI proxy (`https://your-host/__clerk/`) |

Redeploy after any env change.

## Vercel — Preview (branch / PR deploys)

- **Environment variables:** Copy the same keys as Production into the **Preview** environment if you want Checkout, webhooks, or Clerk to behave like prod on preview URLs. For **lesson UI / flow smoke tests** without billing, Preview can rely on **paywall + learn-route auth bypasses** (see **`features.md`**) — you still need valid **Clerk** keys on the client if **`/`** or **`ClerkProvider`** must initialize; allowlist **`*.vercel.app`** in Clerk when the marketing shell is blank.  
- **`VERCEL_ENV`** is **`preview`** on Preview deployments (used by **`shouldEnforceSubscriptionAccess`** and dev-access helpers).  

## Vercel / registrar — domain DNS

- **`write.arabivo.net`** must resolve to your deployment: add the **subdomain** in **Vercel → Project → Domains**, then add the **CNAME** (or record) Vercel shows under **Vercel Domains** for **`arabivo.net`**. DNS records are **not** environment variables.  
- Domains bought **through Vercel** still need **`write`** (or full host) records as instructed when you attach the hostname to the project.

## Clerk — production instance

1. **Domains** — Production DNS for **`write.arabivo.net`** and Clerk subdomains (**`clerk.write`**, **`accounts.write`**, email/DKIM if used) until Clerk shows **Verified** and SSL **Issued**.  
2. **Google / social sign-in** — Production needs **your own** OAuth client (e.g. Google Cloud Console) and redirect URIs exactly as Clerk lists; shared dev credentials are not enough.  
3. **CSP / CORS on `clerk.*`:** **`proxy.ts`** enables Clerk **`contentSecurityPolicy`** on `clerkMiddleware` (includes FAPI host + **`connect-src: https://*.posthog.com`** for PostHog). If **`clerk.write.arabivo.net`** still fails, see **`clerk-production.md`** (path proxy **`NEXT_PUBLIC_CLERK_PROXY_URL`** optional).  
4. See **`Projectdocs/clerk-production.md`** for blank sign-in, VPN, and troubleshooting.

## Stripe

- **Customer portal** enabled in Stripe Dashboard.  
- **Webhook** `POST https://<your-domain>/api/webhooks/stripe` with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.  
- See **`Projectdocs/stripe.md`**.

## Supabase

- Run **`20260403120000_user_progress.sql`**, **`20260405120000_user_subscriptions.sql`**, **`20260530120000_user_onboarding.sql`**, and **`20260606120000_user_daily_challenge.sql`** on the production database (SQL Editor).  
- See **`Projectdocs/supabase-production.md`**.

## Smoke tests before “released” (production host)

1. Open **`https://<host>/sign-in`** — Clerk form loads; Google (or email) works.  
2. Open **`https://<host>/`** — scroll to **`#challenge`** or open **`/daily`**; trace **today’s word** until the bar reaches **~88%+** (no sign-in, no **Check** button); success should not jump the page.  
3. **Daily streak (signed in)** — complete **`/daily`** → row in **`user_daily_challenge`**; **`/dashboard`** shows **Daily challenge** card with streak.  
4. **Onboarding** — signed out, **Let's go!** → complete questions → trace **س** → projection → sign-up → lands on **`/subscribe`** (no extra trace exercises).  
5. Signed in **without** subscription — **`/lessons`** redirects to **`/subscribe`** (then into Stripe Checkout) when billing is configured on **Production**.  
6. From **`/`** pricing — **Start free trial** / **Subscribe** → auth → **`/subscribe`** → Checkout completes; webhook writes **`user_subscriptions`**; **`/lessons`** loads.  
7. Complete a lesson — row in **`user_progress`**.  
8. **Manage billing** — from dashboard **Billing** card (subscribers only) — Stripe Customer Portal opens.  
9. **Replay / progression** — in a **fully completed** section, complete a lesson → **Next** should go to the **next lesson in the section**, not dump you on the lessons index early; after the **last** lesson, **Next** should land on **that section’s hub**.  
10. **Curriculum breadth** — on **`/dashboard`**, confirm stats chips, **Daily challenge** card, **Up Next** card (if progress exists), and **four** unit cards with progress rings; on **`/lessons`**, confirm **four** unit blocks with section cards; under **Simple words**, **seven** section cards; under **Challenge words**, **Can you write this?** with all **8** items unlocked; open **`/lessons/sections/challenge-words-core`** and confirm Arabic **Tap to start** rows; open **`/lessons/challenge-mustashfayat`** and confirm the canvas guide fits without overlap and stays slightly visible under ink dots.  
11. **Demo success CTA** — pass the homepage **`#challenge`** demo while signed out; confirm **Start your first lesson** → **`/onboarding`**. Signed in with subscription, confirm success CTA → **`/lessons`**.  
12. **PostHog (optional)** — with env set and ad blocker off, confirm **`$pageview`** and **`daily_challenge_passed`** in PostHog **Live events** after visiting **`/daily`**.

## After a production deploy

- Watch **Vercel → Logs** for spikes in **`[user_progress]`** or **`[stripe]`** lines (structured diagnostics on progress fetch failures include **`clerkUserIdQueried`** and **`supabaseHost`** — see **`lib/progress/queries.ts`**).  
- Confirm **Clerk** and **Stripe** dashboards show traffic from the production hostname.

## Related docs

- **`stripe.md`** — API routes, paywall behaviour, trial env  
- **`clerk-production.md`** — Clerk DNS, CSP, proxy, console checks  
- **`supabase-production.md`** — migrations and Supabase env  
- **`database.md`** — `user_progress`, `user_subscriptions`, **`user_onboarding`**, **`user_daily_challenge`**
- **`context.md`** (curriculum / section ids), **`features.md`**, **`userflow.md`**, **`techstack.md`**, **`todo.md`**
