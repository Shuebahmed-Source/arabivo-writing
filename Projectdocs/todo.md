# Development Roadmap

Status is relative to the **current codebase** (not a strict phase gate).

## Done (as implemented)

- **Phase 1 — Setup:** Next.js App Router, TypeScript, Tailwind, shadcn/ui, Clerk, Supabase client wiring, env templates  
- **Phase 2 — Core UI:** Landing, auth pages, dashboard, responsive learn shell  
- **Phase 3 — Canvas:** Pointer-based drawing, clear, faint guide, normalized stroke replay on resize  
- **Phase 4 — Lesson system:** `lib/lessons.ts` curriculum with **units, sections, and lessons**; static params for lesson and section routes; section hubs and reorganized Arabic letters (Letters I–V + full isolated set)  
- **Phase 5 — Progress:** `user_progress` table, save on Good/Excellent, **section-based** unlock, dashboard, **`/lessons` section cards**, locked-lesson redirect, **post-save “Next”** — **next lesson in section order** (replay-safe); after **last** lesson in section → **that section’s hub** (`getPostCompletionPath`)  
- **Phase 6:** Emerald-tinted theme, feedback panel polish, mobile-friendly writing section, **lesson complete overlay** (Framer Motion), clearer Supabase error messages and service-role vs anon detection  
- **Auth routing:** **`proxy.ts`** (Next.js 16 convention) with Clerk — replaces deprecated root `middleware.ts` for protected learn routes  
- **Phase 7 — Billing:** Stripe Checkout + Customer Portal + webhooks; **`user_subscriptions`** migration; dashboard **Subscribe** / **Manage billing**; optional **`STRIPE_TRIAL_PERIOD_DAYS`**; **paywall** on **`/lessons`** + **`recordLessonCompletion`** when Stripe is configured **on Vercel Production** (**`shouldEnforceSubscriptionAccess()`**); **`FREE_ACCESS_EMAILS`** allowlist; **`proxy.ts`** Clerk **CSP** and optional **`NEXT_PUBLIC_CLERK_PROXY_URL`** FAPI path proxy  
- **Dev / Preview QA:** **`lib/env/dev-access.ts`** — skip **`auth.protect()`** and lesson unlock redirects on **Vercel Preview** and **localhost** / **`next dev`** so **`/lessons`** is testable without Clerk session; subscription enforcement also skipped on Preview/local (see **`features.md`**)  

## In progress / optional next

- **Content in Supabase:** Migrate `lessons` (and optionally `units` / `sections`) from `lib/lessons.ts` to tables; keep app reading from API  
- **Users table:** Optional `users` row synced from Clerk webhooks for FK cleanliness  
- **Attempts / analytics:** `user_attempts` or event logging if product needs history  
- **Clerk + Supabase RLS:** JWT bridge so policies can use `auth.uid()`-style claims instead of service role only  
- **Home UX:** Signed-in shortcut to `/lessons` or `/dashboard` from `/`  
- **Numbers / extra units:** Add rows and units when curriculum expands  
- **Production hardening:** Stricter error handling, rate limits, monitoring  
- **Legal / policy:** Terms, privacy, refund wording for paid product (outside codebase)  
- **Pricing page:** Dedicated marketing copy if not relying on dashboard card alone  

## Explicitly deferred

- Full gamification, streaks, leaderboards  
- AI or external handwriting recognition  
- Offline-first sync  
