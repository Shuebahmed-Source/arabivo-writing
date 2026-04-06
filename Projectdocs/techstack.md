# Tech Stack

## Frontend

- **Next.js 16** (App Router)  
- **React 19**, **TypeScript**  
- **Tailwind CSS v4**  
- **shadcn/ui** (Base UI–backed components in current preset)  
- **lucide-react** icons  
- **Framer Motion** — lesson complete overlay (staggered layout, progress bar animation)  

## Routing and layouts

- **Route groups:** `(marketing)` — landing; `(auth)` — Clerk sign-in/up; `(learn)` — dashboard + lessons + section hubs + shared **SiteHeader**  
- **`proxy.ts`** (project root) — Clerk **`clerkMiddleware`**: **`auth.protect()`** for **`/dashboard`** and **`/lessons`**; **`contentSecurityPolicy: {}`** so Clerk’s Frontend API script host is CSP-allowed; optional **`frontendApiProxy`** when **`NEXT_PUBLIC_CLERK_PROXY_URL`** is set (path **`/__clerk`**). Matcher includes **`__clerk`** when proxying. Next.js 16 uses the **proxy** file convention; older **`middleware.ts`** is not used.  
- **`app/(learn)/lessons/layout.tsx`** — when Stripe billing env is configured, requires **`active`** / **`trialing`** subscription before rendering lesson routes; otherwise redirect to **`/subscribe`**.  
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

## Progress logic (app code)

- **`lib/progress/unlock.ts`** — section-scoped unlock, section entry, section fully complete  
- **`lib/progress/post-completion.ts`** — URL after successful save (next item / next section / lessons list)  
- **`lib/progress/dashboard-units.ts`** — dashboard unit aggregates  
- **`lib/progress/queries.ts`** — fetch `user_progress` for the signed-in user  

## Writing canvas

- **HTML Canvas 2D**  
- Offscreen **guide** and **user ink** masks for scoring **`getImageData`** comparison  
- Stroke history stored in **normalized coordinates** for resize replay  

## Deployment

- **Vercel** (intended)  

## Fonts

- **Inter** — UI (via `next/font/google`)  
- **Noto Sans Arabic** — Arabic script and canvas guide probing  

## Design

- Mobile-first, emerald-oriented tokens in **`app/globals.css`** (shadcn-compatible CSS variables)  

## Environment variables (reference)

See **`.env.example`**: Clerk publishable + secret; optional **`NEXT_PUBLIC_CLERK_SIGN_IN_URL`**, **`NEXT_PUBLIC_CLERK_SIGN_UP_URL`**, fallback redirect URLs, **`NEXT_PUBLIC_APP_URL`**, **`NEXT_PUBLIC_CLERK_PROXY_URL`**; Supabase URL, anon key, **service role**; Stripe keys, **`STRIPE_PRICE_ID`**, **`STRIPE_WEBHOOK_SECRET`**, optional **`STRIPE_TRIAL_PERIOD_DAYS`**. Local overrides in **`.env.local`** (gitignored). Summary: **`Projectdocs/launch-checklist.md`**.  
