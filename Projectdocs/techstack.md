# Tech Stack

## Frontend

- **Next.js 16** (App Router)  
- **React 19**, **TypeScript**  
- **Tailwind CSS v4**  
- **shadcn/ui** (Base UI–backed components in current preset)  
- **lucide-react** icons  
- **Framer Motion** — lesson complete overlay (staggered layout, progress bar animation)  
- **PostHog** (optional) — demo funnel events via **`PostHogProvider`** when env keys are set  

## Routing and layouts

- **Route groups:** `(marketing)` — landing, **`/try`**, **`/subscribe`**; `(auth)` — Clerk sign-in/up; `(learn)` — dashboard + lessons + section hubs + shared **SiteHeader**  
- **`proxy.ts`** (project root) — Clerk **`clerkMiddleware`**: **`auth.protect()`** for **`/dashboard`** and **`/lessons`** **in production**; when **`isPreviewOrLocalDevBypassFromRequest(req)`** (**`lib/env/dev-access.ts`**) is true (Vercel **Preview**, **`next dev`**, or localhost), **`protect`** is skipped so those routes load without sign-in. **`contentSecurityPolicy: {}`** so Clerk’s Frontend API script host is CSP-allowed; optional **`frontendApiProxy`** when **`NEXT_PUBLIC_CLERK_PROXY_URL`** is set (path **`/__clerk`**). Matcher includes **`__clerk`** when proxying. Next.js 16 uses the **proxy** file convention; older **`middleware.ts`** is not used.  
- **`app/(learn)/lessons/layout.tsx`** — when Stripe billing is configured **and** **`shouldEnforceSubscriptionAccess()`** is true (**Vercel Production**), requires subscription access before rendering lesson routes; otherwise redirect to **`/subscribe`**. If the Preview/local dev bypass is active, the layout returns children without auth or subscription checks. **`/`** and **`/try`** are outside this layout and stay public.  
- Learn layout uses **`dynamic = "force-dynamic"`** so progress reads stay fresh  

## Backend and data

- **Supabase** (PostgreSQL)  
- **`user_progress` table** — see `Projectdocs/database.md`  
- **Server-only Supabase client** with **`SUPABASE_SERVICE_ROLE_KEY`** for reads/writes (RLS enabled; no anon policies; app verifies **Clerk** `userId` before writing). Optional guard treats JWT **`anon`** keys as misconfiguration for the service-role slot.  
- **Public env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon unused for progress MVP; reserved for future client patterns)  
- **Stripe** — Checkout via **`/subscribe`** and **`POST /api/checkout`** (shared **`lib/stripe/createCheckoutSession.ts`**), billing portal (**`POST /api/billing-portal`**), webhooks (**`POST /api/webhooks/stripe`**); **`user_subscriptions`** table. See **`Projectdocs/stripe.md`**.  

## Authentication

- **Clerk** (`@clerk/nextjs`) — `ClerkProvider` (with **`signInUrl` / `signUpUrl`** and fallback redirects), `SignIn` / `SignUp`, `UserButton`, control component **`Show`** for signed-in/out UI  
- **Production / blank sign-in** — see **`Projectdocs/clerk-production.md`** (domain allowlist, matching `pk_live`/`sk_live` keys on Vercel, `NEXT_PUBLIC_APP_URL`)  

## Lesson content

- **In-repo TypeScript** — **`lib/lessons.ts`**: `UNITS`, **`SECTION_META`**, **`lessons`** with **`sectionId`**; helpers **`getSectionsOrdered`**, **`getSectionById`**, **`getLessonsInSection`**, **`getLessonShortTitle`**, etc. Single source of truth until content moves to Supabase.  
- **Curriculum size (current):** **79** lessons across **14** sections in **four** units (letters, letter forms, simple words with **seven** themed word sections, challenge words with **one** open section) — see **`Projectdocs/context.md`**.  
- **Marketing demo config** — **`lib/marketing/demo-challenge.ts`** references **`challenge-shin-triple`** for **`/`** and **`/try`**.

## Progress logic (app code)

- **`lib/progress/unlock.ts`** — section-scoped unlock, **open** sections, **always-available** units, section entry, section fully complete  
- **`lib/progress/post-completion.ts`** — URL after successful save: **next lesson in section order** (replay-safe); after the **last** lesson in the section, **`/lessons/sections/[sectionId]`** for that section  
- **`lib/env/dev-access.ts`** — **`isPreviewOrLocalDevBypassFromRequest`** / **`isPreviewOrLocalDevBypassServer`** for Preview/local QA (auth + unlock skips)  
- **`lib/stripe/server.ts`** — Stripe helpers plus **`shouldEnforceSubscriptionAccess()`** (subscription paywall only when **`VERCEL_ENV=production`** on Vercel)  
- **`lib/progress/dashboard-units.ts`** — dashboard unit aggregates  
- **`lib/progress/queries.ts`** — fetch **`user_progress`** for the signed-in user; structured **`console.error` / `console.warn`** on misconfig or transport errors (production-safe: no secrets in logs)  

## Writing canvas

- **HTML Canvas 2D**  
- Offscreen **guide** and **user ink** masks for scoring **`getImageData`** comparison  
- Stroke history stored in **normalized coordinates** for resize replay  
- **`guideFontSizeRatio`** (**`lib/writing/lesson-display.ts`**) — scales guide/mask font for long challenge strings  

## Deployment

- **Vercel** (intended)  

## Fonts

- **Inter** — UI (via `next/font/google`)  
- **Noto Sans Arabic** — Arabic script and canvas guide probing  

## Design

- Mobile-first, emerald-oriented tokens in **`app/globals.css`** (shadcn-compatible CSS variables)  

## Environment variables (reference)

See **`.env.example`**: Clerk publishable + secret; optional **`NEXT_PUBLIC_CLERK_SIGN_IN_URL`**, **`NEXT_PUBLIC_CLERK_SIGN_UP_URL`**, fallback redirect URLs, **`NEXT_PUBLIC_APP_URL`**, **`NEXT_PUBLIC_CLERK_PROXY_URL`**; Supabase URL, anon key, **service role**; Stripe keys, **`STRIPE_PRICE_ID`**, **`STRIPE_WEBHOOK_SECRET`**, optional **`STRIPE_TRIAL_PERIOD_DAYS`**; optional PostHog keys for analytics. Local overrides in **`.env.local`** (gitignored). Summary: **`Projectdocs/launch-checklist.md`**.  
