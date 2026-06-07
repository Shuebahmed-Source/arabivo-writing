# Features

**Live product:** **`main`** is deployed to **Vercel Production** (e.g. **`write.arabivo.net`**). Learners get **Clerk + Stripe paywall** as documented below; **section replay** (**Next** in order through completed sections) and related fixes ship on that same branch. **Preview** / **local** bypasses exist only for QA — they do **not** apply when **`VERCEL_ENV=production`**.

## Authentication (Clerk)

- Sign up and sign in (`/sign-up`, `/sign-in`)  
- **Production:** **`/dashboard`**, **`/lessons`**, lesson URLs, and **section URLs** require authentication via **`proxy.ts`** (Clerk **`auth.protect()`** on those paths).  
- **Vercel Preview + local dev:** the same routes can be opened **without** sign-in when **`isPreviewOrLocalDevBypassFromRequest`** / **`isPreviewOrLocalDevBypassServer()`** is true (**`lib/env/dev-access.ts`**): **`VERCEL_ENV=preview`**, or **`NODE_ENV=development`**, or **localhost** / **127.0.0.1** with no `VERCEL_ENV`. **Production** (`VERCEL_ENV=production` on Vercel) is unchanged.  
- Marketing home **`/`**, **`/try`**, **`/daily`**, **`/#challenge`**, and **`/onboarding`** stay public  
- **`ClerkProvider`** sets sign-in/up paths and fallback redirects to **`/dashboard`** (see **`.env.example`** for optional `NEXT_PUBLIC_CLERK_*` URL variables). **`/sign-in`** and **`/sign-up`** accept **`?redirect_url=`** (internal path only) so pricing CTAs can continue to **`/subscribe`** after auth.  
- **Production + Stripe billing configured:** users without subscription access who open **`/lessons`** are redirected to **`/subscribe`** (unless **`FREE_ACCESS_EMAILS`** matches — see **`stripe.md`**). Preview/local may skip both subscription enforcement and learn-route auth (see below).  

## Marketing landing (`/`, `/try`, and `/daily`)

- **Handoff reference:** **`Projectdocs/Landing Page.html`** — implemented with **`marketing-root`** layout, **`components/marketing/marketing.css`**, Fredoka / Hanken / Noto Naskh  
- **Nav (`MarketingHeader`):** wordmark, **Try** (`/#challenge`), **Features** (`/#features`), **Pricing** (`/#pricing`), **Sign in**, primary trial CTA  
- **Hero:** two-column layout, animated **سلام** trace mockup card, **`MarketingTrialCTAs`** — **Let's go!** → **`/onboarding`**, **Sign in** ghost button  
- **`#challenge`:** dark section, **`LandingChallengeSection`** — **today’s word** (one word per **UTC day** from a curated pool in **`lib/daily-challenge/pool.ts`**); honest **0–100%** coverage bar (pass at **88%**); user can **keep tracing** after pass; success expands **inside the card** (no page jump); **no Check**; **no lesson progress save**  
- **`/daily`:** shareable page with the same daily challenge (`compactHeading`) + **Home** back link  
- **Features:** six emoji cards; **Pricing:** centered plan card + checklist; **Footer** with legal placeholders  
- **`/try`:** same **`LandingChallengeSection`** as **`/daily`** (`compactHeading`) + **Home** back link  
- **`MarketingTrialCTAs`** / **`primaryTrialCtaLabel`** — hero, pricing, and demo-success variants; PostHog **`subscribe_click`** when analytics env is set  
- **PostHog events (when env set):** **`daily_challenge_started`**, **`daily_challenge_passed`**, **`demo_trace_passed`**, **`$pageview`**, plus lesson/checkout events — see **`PostHogProvider`** in **`app/layout.tsx`**

## Daily challenge (retention)

- **Word rotation:** **`getDailyChallenge()`** in **`lib/daily-challenge/get-daily-challenge.ts`** — deterministic pick from **`DAILY_CHALLENGE_POOL`** by UTC calendar day (same word globally that day)  
- **Public:** no sign-in required to trace on **`/#challenge`**, **`/try`**, **`/daily`**  
- **Streak (signed-in only):** completing today’s trace saves to **`user_daily_challenge`** via **`recordDailyChallengeCompletion`**; streak count from consecutive UTC days (**`lib/daily-challenge/streak.ts`**) — **not** tied to lesson **`user_progress`**  
- **Dashboard:** **`DashboardDailyChallengeCard`** — today’s Arabic word, streak badge, link to **`/daily`**  
- **Grace rule:** if today is not done yet, yesterday’s completion still counts toward the displayed streak until UTC midnight  
- **Anonymous users:** see sign-up CTA to save a streak; no row written without Clerk session

## Onboarding funnel (`/onboarding`)

- **`/onboarding`** — signed-out profiling + **one** trace (**س**) + projection + Clerk sign-up → **`/subscribe`**  
- **Hero CTA (signed out):** **`Let's go!`** → **`/onboarding`** via **`MarketingTrialCTAs`** (`variant="hero"`)  
- **Steps:** welcome (server-rendered) → **`?step=q0`…`q4`** → **`trace`** → **`projection`** → **`signup`**  
- **Session storage** (`arabivo_onboarding_v1`) holds answers until sign-up; then **`saveOnboardingProfile`** → Supabase **`user_onboarding`**  
- **Sign-up:** custom Clerk flow (**Google** + email/password + verification); OAuth callback **`/onboarding/sso-callback`**  
- **After sign-up:** **`/subscribe`** only — **no** three-word post-signup demo (`/onboarding/demo` redirects to **`/subscribe`**)  
- **Fonts / UI:** Fredoka, Hanken Grotesk, Noto Naskh Arabic scoped in **`app/onboarding/layout.tsx`**; styles in **`components/onboarding/onboarding.css`**  
- **Trace canvas:** **`OnboardingTraceStep`** — cell coverage algorithm, **`onboardingTraceFontSize`**, resolved Arabic font via computed style (canvas cannot use CSS variables directly); user can keep tracing after 50% celebration  

## Learning path

- **Local curriculum** in **`lib/lessons.ts`** — units, **sections** (metadata + ordered `lessonIds`), and **lessons** with `sectionId`; not stored in Supabase yet  
- **Section-based unlocking** (see `lib/progress/unlock.ts`):  
  - First item of the first **sequential** section is open by default  
  - Sequential completion **within** each sequential section  
  - **Full section** completion required before the **next sequential section** unlocks  
  - **Open sections** (`unlockPolicy: "open"`) — all items unlocked immediately  
  - **Always-available units** (`alwaysAvailable: true`) — unit reachable on dashboard without prior unit completion  
- **Four units**: Arabic letters (**5** sections), letter forms (**1** section), simple words (**7** sections), challenge words (**1** open section) — **79** total lessons in `lib/lessons.ts` (28 letters + 4 forms + 39 words + 8 challenge)  
- **Simple words section ids** (in curriculum order): `simple-words-i`, `simple-words-ii`, `simple-words-iii`, `simple-words-body-people`, `simple-words-home-objects`, `simple-words-nature`, `simple-words-animals`  
- **Challenge section id:** `challenge-words-core` — **Can you write this?** (8 challenge lessons; pick any order)  
- **`/dashboard`** (handoff UI): stats chips (overall %, lessons complete, sections done), **Daily challenge** card (today’s word + streak → **`/daily`**), **Up Next** continue card → first incomplete lesson, **All sections** grid with **SVG progress rings**, unit cards link to **`/lessons#<unitId>`** — data via **`lib/learn/dashboard-data.ts`**, UI **`DashboardView`**  
- **`/lessons`** (handoff UI): four **unit blocks** with Arabic header watermarks; **section cards** with progress dots, status badges (**Done** / **In progress** / **Available** / **Locked**), links to first incomplete lesson — **`lib/learn/lessons-data.ts`**, UI **`LessonsView`**  
- **`/lessons/sections/[sectionId]`** — section hub (learn handoff): Arabic-first **tappable lesson rows**, **Continue**, **Next section** when complete — **`SectionHubView`**, **`learn-main-section`**  
- **`/lessons/[lessonId]`** — practice page (shadcn shell); breadcrumb back to section hub  
- Locked lesson URL → **redirect to `/lessons`** (unlock rules skipped in Preview/local when the dev bypass is active — any lesson or section hub URL is reachable for QA)  

## Production vs Vercel Preview / local (testing)

- **`shouldEnforceSubscriptionAccess()`** (**`lib/stripe/server.ts`**): subscription paywall runs only when **`VERCEL_ENV === "production"`** on Vercel; **Preview** and non-Vercel hosts skip it for **`/lessons`** layout and **`recordLessonCompletion`**.  
- **Auth bypass** (see **Authentication**): Preview/local can use **`/dashboard`** and **`/lessons`** without Clerk session. **Saving progress** still requires a signed-in **`userId`** in **`recordLessonCompletion`** — anonymous Preview users can trace and **Check**, but persist flow needs sign-in (or test signed-in on Preview).  
- **`git` workflow:** feature work on **`dev`**; merge to **`main`** for production — see **`github.md`**.  

## Writing practice

- HTML **Canvas** with faint Arabic guide (same glyph as the lesson)  
- **Pointer-only** drawing (touch, stylus, mouse)  
- **Clear** — resets strokes and on-screen feedback (not saved progress)  
- **Check** — approximate scoring vs a hidden guide mask; **Try again** does not persist  
- **Dynamic guide font size** — **`fitGuideFontSizePx`** measures Arabic on canvas and shrinks long strings to fit width; **`GUIDE_OVER_INK_SCALE`** keeps guide glyphs slightly wider than ink so the faint outline stays visible when tracing; sidebar/list reference text uses **`referenceArabicFontSize`**

## Scoring and feedback

- Outcomes: **Excellent**, **Good**, **Try again**  
- Thresholds in **`components/writing/score-user-trace.ts`** are tuned for beginners (relaxed coverage/precision and off-guide caps vs earlier stricter defaults); still pixel-overlap based, not OCR  
- Inline **WritingFeedbackPanel** after **Check** (headline + coaching copy) for all outcomes  
- On **Good** / **Excellent**, **progress save** (server action + Supabase) then **Lesson complete overlay** (Framer Motion): staggered entrance, animated section progress bar, **deterministic icon + tint per `lessonId`**, **Practice again** or **Next** (lessons only — homepage demo does not save)

## Progress and dashboard

- **`user_progress`** in Supabase: `clerk_user_id`, `lesson_id`, `completed`, `completed_at`, `best_result` (`excellent` | `good`) — **no** `section_id` column; sections are derived in app code  
- **`user_subscriptions`** in Supabase: Stripe subscription snapshot (`status`, `current_period_end`, etc.) — updated via **`/api/webhooks/stripe`**; landing **`#pricing`** + **`/subscribe`** start checkout; dashboard shows **Billing** (**LearnSubscriptionCard**) **only** for **active** / **trialing** users when Stripe env vars are set; **`/lessons`** requires **`active`** or **`trialing`** subscription **in production** when billing is configured (see **`Projectdocs/stripe.md`**; Preview/local may bypass enforcement)  
- **Checkout feedback:** `?checkout=success` on dashboard after payment; **`?checkout=canceled`** or **`?checkout=failed`** on **`/`** (banner at top; links to **`#pricing`**)  
- **Dashboard unit cards:** per-unit **completed / total**, animated **progress ring** %, **In progress** / **✓ Complete** / **Locked** badges; **Challenge words** always reachable when unit unlock rules allow — **`getDashboardUnits`** + **`getLearnDashboardUnitCards`**  
- **Post-save navigation** (`getPostCompletionPath`): after save, **Next** goes to the **next lesson in section order** (even if already completed, for replay); after the **last** lesson in the section, **`/lessons/sections/[sectionId]`** for that section (not auto-advance to the next section)  

## Responsive design

- Mobile-first layout, large tap targets, route groups for marketing vs learn chrome  
- **Section hub** lesson rows are full-width links with 48px+ action buttons; Arabic text wraps on narrow viewports (**`overflow-wrap`**, responsive **`referenceArabicFontSize`**)  
- Canvas stroke data uses **normalized coordinates** so ink survives resize reasonably well  
- **Learn nav:** centered Dashboard / Lessons tabs collapse below **720px** width  

## Not in scope yet

- Lesson rows in Supabase  
- Per-attempt history; **full-site** gamification / lesson streaks / leaderboards (daily challenge streak only — see **Daily challenge** above)  
- `users` sync table in DB (progress keyed by Clerk `userId` only)  
- Numbers unit and extended connection curriculum (optional future)  
- Handoff styling for **lesson detail** page (still shadcn / Inter); section hub is done  
- PostHog reverse proxy (optional — reduces ad-blocker loss); onboarding funnel step events
