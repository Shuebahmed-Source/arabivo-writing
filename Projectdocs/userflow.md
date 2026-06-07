# User Flow

**Production:** This flow matches **`write.arabivo.net`** (or your live host) built from **`main`**. **Preview** URLs may skip sign-in on **`/lessons`** for testing only — see **`features.md`**.

## Entry

1. User visits **`/`** (landing) — hero with trace mockup, **`#challenge`** daily word, **`#features`**, and **`#pricing`**.  
2. **`/daily`** — shareable **today’s word** challenge (same canvas as **`#challenge`**, compact heading, **Home** back link).  
3. **`/try`** — same daily challenge as **`/daily`** (bio, ads).  
4. **`/subscribe`** — After sign-in, shows a **plan summary page** (price from Stripe, trial copy from **`STRIPE_TRIAL_PERIOD_DAYS`**), then **Continue** calls **`POST /api/checkout`** and redirects to Stripe. Not an instant redirect-only route.

4. **Primary CTA** (hero, pricing, and marketing header): **signed-out hero** → **`Let's go!`** → **`/onboarding`** (profiling + one trace + sign-up → **`/subscribe`**). **Pricing / header trial CTAs** use **`primaryTrialCtaLabel`** — **`Start 3-Day Free Trial`** when **`STRIPE_TRIAL_PERIOD_DAYS`** is **3**, **`Start 7-Day Free Trial`** when **7**, **`Start Free Trial`** for other **n > 0**, else **`Start your free trial`** — those go to **`/sign-up`** or **`/sign-in`** with **`redirect_url=/subscribe`**, then **`/subscribe`** (plan page) → **Stripe Checkout**. **Signed-in** users on marketing pages use **`Start your free trial`** → **`/subscribe`** directly. Session for first paint comes from server **`auth()`** (`initialSignedIn`) so the hero does not flash the signed-out layout while Clerk loads.  
5. **Hero secondary:** **try a challenge free** → scroll to **`#challenge`** or open **`/daily`** (no account).  
6. Generic visits to **`/sign-in`** / **`/sign-up`** without **`redirect_url`** still use Clerk’s fallback **`/dashboard`** (root layout).  

**Note:** The marketing header links to **`/#challenge`**, **`/#features`**, **`/#pricing`**, and sign-in; **`/try`** and **`/daily`** are standalone challenge pages. The in-app **`LearnHeader`** (after sign-in) links to **`/dashboard`** and **`/lessons`**. Signed-in users who open **`/onboarding`** are redirected to **`/dashboard`**.

## Onboarding funnel (`/onboarding`)

7. **Entry:** **`/`** hero **Let's go!** → **`/onboarding`** (signed-out only). **Welcome** is server-rendered; steps use **`?step=`** query params (`q0`–`q4`, `trace`, `projection`, `signup`).  
8. **Five questions** — single-select profiling (level, why, experience, time, goal). Answers live in **session storage** until sign-up, then persist to Supabase **`user_onboarding`**.  
9. **One trace** — **`?step=trace`**: trace **س** (sīn) on the onboarding canvas (**`OnboardingTraceStep`**). Coverage ≥ 50% shows celebration; user can **keep tracing** until they tap **Continue**.  
10. **Projection** — personalized 1-year chart from answers.  
11. **Sign up** — **`?step=signup`**: Clerk custom sign-up (Google OAuth or email + verification). **Free account** — no payment on this step.  
12. **After sign-up** → **`/subscribe`** (plan summary + Stripe Checkout). **No** extra post-signup trace exercises. Google OAuth uses **`/onboarding/sso-callback`** then **`/subscribe`**.  
13. **`/onboarding/demo`** — legacy URL; redirects signed-in users to **`/subscribe`**.  

## Public daily challenge (`/#challenge`, `/daily`, `/try`)

14. User sees **today’s word** (rotates daily, UTC) on a dark tracing canvas — **no sign-in**.  
15. User traces the guide; an honest **0–100% coverage bar** fills as they draw (**no Check button**; no **`user_progress`** save).  
16. When coverage reaches **88%**: success message appears **inside the card** (user can keep tracing to 100%); PostHog **`daily_challenge_passed`** when analytics env is set.  
17. **Signed in** — streak saved to **`user_daily_challenge`**; dashboard **Daily challenge** card shows count; success may show **🔥 n-day streak**. **Signed out** — sign-up CTA to save streak.  
18. Success CTAs: **signed-out** → **`MarketingTrialCTAs`** (**Start your first lesson** → **`/onboarding`**); **signed-in** → **`/lessons`**.  

## Protected app (production)

19. **`/dashboard`**, **`/lessons`**, **`/lessons/sections/*`**, and **`/lessons/[lessonId]`** require sign-in via Clerk **`proxy.ts`** (**`auth.protect()`**). **`/subscribe`** is public (unauthenticated users are redirected to sign-in). **`/`**, **`/try`**, **`/daily`**, **`/#challenge`**, and **`/onboarding`** (welcome for signed-out users) remain public.  
20. **Dashboard** — **Daily challenge** card (today’s word + streak → **`/daily`**), stats row, **Up Next** continue card (when applicable), **four** unit section cards with progress rings; **Billing** (manage portal) only when the user already has an **active** or **trialing** subscription. No subscribe sales card on the dashboard.  

### Billing gate (production, when Stripe env is complete)

If **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are set **and** **`shouldEnforceSubscriptionAccess()`** is true (**Vercel Production**), **`/lessons`** and nested lesson URLs require subscription access (**`hasSubscriptionAccessForCurrentUser()`** — Stripe **active/trialing** or **`FREE_ACCESS_EMAILS`**). Otherwise the app redirects to **`/subscribe`**. **`/dashboard`** is not paywalled. If Stripe env is incomplete, lessons are not paywalled. Saving progress uses the same subscription check when enforcement is on. The **homepage demo** is **not** paywalled.

### Vercel Preview and local development

For **Preview** (`VERCEL_ENV=preview`), **`next dev`**, or **localhost** / **127.0.0.1** (`next start`), the app **skips** learn-route **`auth.protect()`** and subscription enforcement so **`/lessons`** and lesson URLs are usable without sign-in for UI/flow testing. **Progress save** still requires a Clerk **`userId`**. See **`lib/env/dev-access.ts`** and **`Projectdocs/features.md`**.  

### After Checkout

Successful payment returns to **`/dashboard?checkout=success`**. Canceled Checkout returns to **`/?checkout=canceled`** (homepage banner; viewport stays at top).

## Lessons overview

20. **`/lessons`** — four **unit blocks** (Arabic letters, letter forms, simple words, challenge words). Each block has a header (title, description, unit progress badge) and a grid of **section cards** (Letters I–V, letter forms, seven simple-word sections, **Can you write this?**). See **`context.md`** for section ids.  
21. Each section card shows **progress dots**, **Done** / **In progress** / **Available** / **Locked**, and links to the **first incomplete unlocked lesson** (or section hub fallback). **Challenge words** section is never locked.  
22. User taps an unlocked section card → **`/lessons/[lessonId]`** (or section hub when all items in that section are complete).  

## Section hub

23. Section page (**`/lessons/sections/[sectionId]`**, learn handoff) shows unit eyebrow, **section title**, description, **Continue →** (first incomplete unlocked lesson), and a list of **Arabic-first lesson rows**. Each unlocked row is a **full-width tap target** with large Arabic, lesson title, English note, and **Tap to start** / **✓ Done** badge. **Next section →** appears when the section is fully complete. In **open** sections (challenge), all items are unlocked from the start — **Continue** picks the first incomplete.  
24. User taps any **unlocked** row → **`/lessons/[lessonId]`**.  

## Lesson detail (practice)

25. **Back to section** (breadcrumb) returns to **`/lessons/sections/[sectionId]`**.  
26. Page shows unit · **section link**, lesson title, type badge (**CHALLENGE · TRACE** for challenge items), **Completed** if already saved, Arabic, transliteration, meaning.  
27. **Practice writing** — canvas with faint guide; user traces with finger, stylus, or mouse. Long words (e.g. **مستشفيات**) auto-fit canvas width; guide glyphs render **slightly larger than ink** so a grey rim stays visible when tracing dots or strokes.  
28. User taps **Check**.  
29. Feedback appears: **Excellent**, **Good**, or **Try again** (inline panel).  

### If Good or Excellent

30. Progress is **saved** to Supabase (upsert per `clerk_user_id` + `lesson_id`).  
31. **Lesson complete** full-screen overlay appears (animated): section title, **x/y** progress bar, short lesson title, result line, faint Arabic watermark, **Practice again** (close overlay, clear canvas) or **Next** — navigates to the **next lesson in the same section** in order (including replay when later lessons are already complete); after the **last** lesson in the section, **`Next`** goes to **`/lessons/sections/[sectionId]`** for that section (**`getPostCompletionPath`** in **`lib/progress/post-completion.ts`**).  
32. User can still **Practice again** on the same lesson later; **best_result** does not downgrade (e.g. **excellent** kept over **good**).  

### If Try again

33. No save; user may **Clear** and retry.  

## Locked lesson

34. If the user opens a locked lesson URL, the app **redirects to `/lessons`** (skipped when Preview/local dev bypass is active — see **Protected app**). Open-section challenge lessons are never locked.

## Locked section

35. If the user opens a section whose **first lesson** is not unlocked, the app **redirects to `/lessons`** (skipped when Preview/local dev bypass is active). **Challenge words** section entry is always unlocked.

## Completion (MVP)

36. There is no single global “course complete” finale; progression continues through **sections** and **units**. After the **final lesson in a section**, **Next** returns to that **section hub**; from there the learner can pick another section or return to **`/lessons`**. Challenge items can be done in any order and do not gate the main curriculum.
