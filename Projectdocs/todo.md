# Development Roadmap

Status is relative to the **current codebase** (not a strict phase gate).

## Done (as implemented)

- **Phase 1 — Setup:** Next.js App Router, TypeScript, Tailwind, shadcn/ui, Clerk, Supabase client wiring, env templates  
- **Phase 2 — Core UI:** Landing, auth pages, dashboard, responsive learn shell  
- **Phase 3 — Canvas:** Pointer-based drawing, clear, faint guide, normalized stroke replay on resize  
- **Phase 4 — Lesson system:** `lib/lessons.ts` curriculum with **units, sections, and lessons**; static params for lesson and section routes; section hubs; reorganized Arabic letters (Letters I–V + full isolated set); **simple words** as **seven** themed sections (I–III plus body & people, home & objects, nature, animals) with **39** word lessons — see **`context.md`**  
- **Phase 5 — Progress:** `user_progress` table, save on Good/Excellent, **section-based** unlock, dashboard, **`/lessons` section cards**, locked-lesson redirect, **post-save “Next”** — **next lesson in section order** (replay-safe); after **last** lesson in section → **that section’s hub** (`getPostCompletionPath`)  
- **Phase 6:** Emerald-tinted theme, feedback panel polish, mobile-friendly writing section, **lesson complete overlay** (Framer Motion), clearer Supabase error messages and service-role vs anon detection  
- **Auth routing:** **`proxy.ts`** (Next.js 16 convention) with Clerk — replaces deprecated root `middleware.ts` for protected learn routes  
- **Phase 7 — Billing:** Stripe Checkout + Customer Portal + webhooks; **`user_subscriptions`** migration; dashboard **Subscribe** / **Manage billing**; optional **`STRIPE_TRIAL_PERIOD_DAYS`**; **paywall** on **`/lessons`** + **`recordLessonCompletion`** when Stripe is configured **on Vercel Production** (**`shouldEnforceSubscriptionAccess()`**); **`FREE_ACCESS_EMAILS`** allowlist; **`proxy.ts`** Clerk **CSP** and optional **`NEXT_PUBLIC_CLERK_PROXY_URL`** FAPI path proxy  
- **Dev / Preview QA:** **`lib/env/dev-access.ts`** — skip **`auth.protect()`** and lesson unlock redirects on **Vercel Preview** and **localhost** / **`next dev`** so **`/lessons`** is testable without Clerk session; subscription enforcement also skipped on Preview/local (see **`features.md`**) — **shipped on `main`**; production users are unaffected.  
- **Observability:** **`fetchUserProgressForCurrentUser`** logs structured errors (**`clerkUserIdQueried`**, **`supabaseHost`**, PostgREST **`code`/`details`/`hint`**, or transport **`cause`**) when reads fail — **`lib/progress/queries.ts`**.  
- **Challenge words unit:** Fourth unit with **`challenge-words-core`** section (**8** viral / puzzle lessons); **`challenge`** lesson type; **open** section unlock + **always-available** unit; dynamic **`guideFontSizeRatio`** for long canvas strings — **79** total lessons — see **`context.md`**.  
- **Onboarding funnel:** **`/onboarding`** — welcome → 5 questions → trace **س** → projection → Clerk sign-up → **`/subscribe`**; **`user_onboarding`** table; **`lib/onboarding/`** + **`components/onboarding/`**; design handoff in **`Projectdocs/design_handoff_onboarding/`**.  
- **Marketing landing (handoff):** **`/`** and **`/try`** rebuilt from **`Projectdocs/Landing Page.html`** — Fredoka/Hanken/Noto Naskh, hero + **`#challenge`** (**قلم**, coverage demo), features, pricing, footer; **`components/marketing/marketing.css`**, **`MarketingTrialCTAs`**, **`LandingChallengeSection`**.  
- **Dashboard & lessons (handoff):** **`/dashboard`** and **`/lessons`** rebuilt from **`Projectdocs/design_handoff_dashboard_lessons/`** — stats, Up Next card, progress rings, unit/section cards with dots; **`components/learn/learn.css`**, **`LearnHeader`**, **`lib/learn/`**.

## In progress / optional next

- **Section hub + lesson detail handoff:** Restyle **`/lessons/sections/[sectionId]`** and **`/lessons/[lessonId]`** to match **`learn.css`** (currently shadcn / Inter)  
- **Content in Supabase:** Migrate `lessons` (and optionally `units` / `sections`) from `lib/lessons.ts` to tables; keep app reading from API  
- **Users table:** Optional `users` row synced from Clerk webhooks for FK cleanliness  
- **Attempts / analytics:** `user_attempts` or richer event logging if product needs history beyond PostHog demo funnel  
- **Clerk + Supabase RLS:** JWT bridge so policies can use `auth.uid()`-style claims instead of service role only  
- **Home UX:** Signed-in shortcut to `/lessons` or `/dashboard` from `/`  
- **Numbers / extra units:** Add a **numbers** unit or more **letter-form** drills when the next curriculum wave ships  
- **Onboarding analytics:** PostHog events for funnel steps (questions, trace pass, sign-up, subscribe)  
- **Production hardening:** Stricter error handling, rate limits, monitoring  
- **Legal / policy:** Terms, privacy, refund wording for paid product (outside codebase); wire footer links on landing  
- **Cleanup:** Remove unused **`TryChallengeDemo`** / **`TrialFunnelCTAs`** if no longer needed  

## Explicitly deferred

- Full gamification, streaks, leaderboards  
- AI or external handwriting recognition  
- Offline-first sync  
