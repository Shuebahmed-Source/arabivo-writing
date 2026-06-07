# Tech Stack

## Frontend

- **Next.js 16** (App Router)  
- **React 19**, **TypeScript**  
- **Tailwind CSS v4**  
- **shadcn/ui** (Base UI–backed components in current preset) — lesson practice detail, auth  
- **Scoped CSS handoffs** — `marketing.css`, `onboarding.css`, `learn.css` for landing, onboarding, dashboard/lessons, and section hubs  
- **lucide-react** icons (practice shell)  
- **Framer Motion** — lesson complete overlay (staggered layout, progress bar animation)  
- **PostHog** (optional) — funnel + daily challenge events via **`PostHogProvider`** when **`NEXT_PUBLIC_POSTHOG_KEY`** / **`NEXT_PUBLIC_POSTHOG_HOST`** are set; CSP in **`proxy.ts`** includes **`connect-src: https://*.posthog.com`**  

## Routing and layouts

- **Route groups:** `(marketing)` — landing, **`/try`**, **`/daily`**, **`/subscribe`** (`marketing-root` + Fredoka fonts); **`app/onboarding/`** — onboarding funnel (`onboarding-root`); `(auth)` — Clerk sign-in/up; `(learn)` — dashboard + lessons + section hubs + lesson detail (`learn-root` + **`LearnHeader`**)  
- **`proxy.ts`** (project root) — Clerk **`clerkMiddleware`**: **`auth.protect()`** for **`/dashboard`** and **`/lessons`** **in production**; when **`isPreviewOrLocalDevBypassFromRequest(req)`** (**`lib/env/dev-access.ts`**) is true (Vercel **Preview**, **`next dev`**, or localhost), **`protect`** is skipped so those routes load without sign-in. **`contentSecurityPolicy`** merges Clerk defaults with **`connect-src: https://*.posthog.com`** for analytics; optional **`frontendApiProxy`** when **`NEXT_PUBLIC_CLERK_PROXY_URL`** is set (path **`/__clerk`**). Matcher includes **`__clerk`** when proxying. Next.js 16 uses the **proxy** file convention; older **`middleware.ts`** is not used.  
- **`app/(learn)/lessons/layout.tsx`** — when Stripe billing is configured **and** **`shouldEnforceSubscriptionAccess()`** is true (**Vercel Production**), requires subscription access before rendering lesson routes; otherwise redirect to **`/subscribe`**. If the Preview/local dev bypass is active, the layout returns children without auth or subscription checks. **`/`**, **`/try`**, **`/daily`**, and **`/#challenge`** are outside this layout and stay public.  
- Learn layout uses **`dynamic = "force-dynamic"`** so progress reads stay fresh  

## Backend and data

- **Supabase** (PostgreSQL)  
- **`user_progress` table** — see `Projectdocs/database.md`  
- **Server-only Supabase client** with **`SUPABASE_SERVICE_ROLE_KEY`** for reads/writes (RLS enabled; no anon policies; app verifies **Clerk** `userId` before writing). Optional guard treats JWT **`anon`** keys as misconfiguration for the service-role slot.  
- **Public env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon unused for progress MVP; reserved for future client patterns)  
- **Stripe** — Lifetime + monthly Checkout via **`POST /api/checkout`** (`{ plan: "lifetime" | "monthly" }`, **`lib/stripe/createCheckoutSession.ts`**), billing portal for monthly (**`POST /api/billing-portal`**), webhooks (**`POST /api/webhooks/stripe`**); **`user_subscriptions`** (`lifetime` / subscription statuses). See **`Projectdocs/stripe.md`**.  

## Authentication

- **Clerk** (`@clerk/nextjs`) — `ClerkProvider` (with **`signInUrl` / `signUpUrl`** and fallback redirects), `SignIn` / `SignUp`, `UserButton`, control component **`Show`** for signed-in/out UI  
- **Production / blank sign-in** — see **`Projectdocs/clerk-production.md`** (domain allowlist, matching `pk_live`/`sk_live` keys on Vercel, `NEXT_PUBLIC_APP_URL`)  

## Lesson content

- **In-repo TypeScript** — **`lib/lessons.ts`**: `UNITS`, **`SECTION_META`**, **`lessons`** with **`sectionId`**; helpers **`getSectionsOrdered`**, **`getSectionById`**, **`getLessonsInSection`**, **`getLessonShortTitle`**, etc. Single source of truth until content moves to Supabase.  
- **Curriculum size (current):** **79** lessons across **14** sections in **four** units (letters, letter forms, simple words with **seven** themed word sections, challenge words with **one** open section) — see **`Projectdocs/context.md`**.  
- **Marketing demo / daily word** — **`lib/daily-challenge/`** (pool, UTC date pick, streak math, Supabase queries); **`lib/marketing/demo-challenge.ts`** exports **`getDailyChallenge()`**; trace sizing/threshold in **`lib/marketing/landing-trace.ts`** (**88%** pass, honest bar).  
- **Learn UI data** — **`lib/learn/dashboard-data.ts`**, **`lib/learn/lessons-data.ts`**, **`lib/learn/arabic-deco.ts`**, **`lib/learn/lesson-status.ts`**. **Learn UI components:** **`DashboardView`**, **`DashboardDailyChallengeCard`**, **`LessonsView`**, **`SectionHubView`** in **`components/learn/`**.  
- **Onboarding** — **`lib/onboarding/`** (steps, routing, session storage, trace font sizing); **`app/actions/onboarding.ts`** (save profile, mark funnel complete); **`app/actions/daily-challenge.ts`** (record daily pass + streak); **`components/onboarding/`** (flow UI, trace canvas, Clerk sign-up). **`demo_completed_at`** in **`user_onboarding`** is set when sign-up finishes (marks onboarding funnel complete, not a separate demo route).

## Progress logic (app code)

- **`lib/progress/unlock.ts`** — section-scoped unlock, **open** sections, **always-available** units, section entry, section fully complete  
- **`lib/progress/post-completion.ts`** — URL after successful save: **next lesson in section order** (replay-safe); after the **last** lesson in the section, **`/lessons/sections/[sectionId]`** for that section  
- **`lib/env/dev-access.ts`** — **`isPreviewOrLocalDevBypassFromRequest`** / **`isPreviewOrLocalDevBypassServer`** for Preview/local QA (auth + unlock skips)  
- **`lib/stripe/server.ts`** — Stripe helpers plus **`shouldEnforceSubscriptionAccess()`** (subscription paywall only when **`VERCEL_ENV=production`** on Vercel)  
- **`lib/progress/dashboard-units.ts`** — dashboard unit aggregates (used by **`getLearnDashboardUnitCards`**)  
- **`lib/progress/queries.ts`** — fetch **`user_progress`** for the signed-in user; structured **`console.error` / `console.warn`** on misconfig or transport errors (production-safe: no secrets in logs)  

## Writing canvas

- **HTML Canvas 2D**  
- Offscreen **guide** and **user ink** masks for scoring **`getImageData`** comparison  
- Stroke history stored in **normalized coordinates** for resize replay  
- **`guideFontSizeRatio`**, **`fitGuideFontSizePx`**, **`GUIDE_OVER_INK_SCALE`**, **`referenceArabicFontSize`** (**`lib/writing/lesson-display.ts`**) — canvas guide/mask sizing for long challenge strings; guide slightly wider than ink (**`CANVAS_INK_LINE_WIDTH_PX`**)  
- **Marketing demo canvas** — separate coverage algorithm in **`LandingChallengeSection`** (pointer events, cell mask, **88%** pass threshold, no **Check**; tracing continues after pass)

## Analytics (optional)

- **PostHog** — **`components/analytics/posthog-provider.tsx`**; events include **`$pageview`**, **`daily_challenge_started`**, **`daily_challenge_passed`**, **`subscribe_click`**, **`demo_trace_passed`**, **`lesson_started`**, **`lesson_completed`**, **`checkout_started`**, **`checkout_completed`**

## Deployment

- **Vercel** (intended)  

## Fonts

- **Inter** — shadcn UI / lesson practice detail (via `next/font/google`)  
- **Noto Sans Arabic** — lesson canvas guide probing on practice pages  
- **Fredoka**, **Hanken Grotesk**, **Noto Naskh Arabic** — marketing (`app/(marketing)/layout.tsx`), onboarding (`app/onboarding/layout.tsx`), learn overview (`app/(learn)/layout.tsx`)

## Design

- Mobile-first; emerald handoff tokens in scoped CSS; shadcn **`globals.css`** variables for lesson detail practice pages  

## Environment variables (reference)

See **`.env.example`**: Clerk publishable + secret; optional Clerk URL vars, **`NEXT_PUBLIC_APP_URL`**, **`NEXT_PUBLIC_CLERK_PROXY_URL`**; Supabase URL, anon key, **service role**; **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`STRIPE_LIFETIME_PRICE_ID`**, **`STRIPE_MONTHLY_PRICE_ID`**, optional **`FREE_ACCESS_EMAILS`**; optional PostHog. Local overrides in **`.env.local`** (gitignored). Summary: **`Projectdocs/launch-checklist.md`**.
