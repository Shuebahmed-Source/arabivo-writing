# User Flow

**Production:** This flow matches **`write.arabivo.net`** (or your live host) built from **`main`**. **Preview** URLs may skip sign-in on **`/lessons`** for testing only — see **`features.md`**.

## Entry

1. User visits **`/`** (landing) — hero with trace mockup, **`#challenge`** daily word, **`#features`**, and **`#pricing`**.  
2. **`/daily`** — shareable **today’s word** challenge (same canvas as **`#challenge`**, compact heading, **Home** back link).  
3. **`/try`** — same daily challenge as **`/daily`**.  
4. **`/subscribe`** — After sign-in, shows the **paywall** (side-by-side monthly + lifetime cards). Each CTA calls **`POST /api/checkout`** with `{ plan }` and redirects to Stripe Checkout.

5. **Primary CTA** (hero): **signed-out** → **`Let's go!`** → **`/onboarding`**. **Header / pricing:** **Get full access** → sign-up or **`/subscribe`** (with **`redirect_url`**). **Signed-in** users on marketing pages use **Get full access** → **`/subscribe`** directly.  
6. **Hero secondary:** **try a challenge free** → **`#challenge`** or **`/daily`** (no account).  
7. Generic **`/sign-in`** / **`/sign-up`** without **`redirect_url`** use Clerk fallback **`/dashboard`**.

**Note:** Marketing header links to **`/#challenge`**, **`/#features`**, **`/#pricing`**, sign-in; **`/try`** and **`/daily`** are standalone. **`LearnHeader`** links to **`/dashboard`** and **`/lessons`**. Signed-in users on **`/onboarding`** redirect to **`/dashboard`**.

## Onboarding funnel (`/onboarding`)

8. **Entry:** **`/`** hero **Let's go!** → **`/onboarding`** (signed-out only). Steps: **`?step=`** (`q0`–`q4`, `trace`, `projection`, `signup`).  
9. **Five questions** — profiling; answers in session storage → **`user_onboarding`** after sign-up.  
10. **One trace** — **س** on onboarding canvas; ≥ 50% celebration; user can keep tracing.  
11. **Projection** — chart from answers.  
12. **Sign up** — Clerk (Google or email). **No payment** on this step.  
13. **After sign-up** → **`/subscribe`** (paywall + Stripe Checkout). **No** extra post-signup demos.  
14. **`/onboarding/demo`** — legacy; redirects to **`/subscribe`**.

## Public daily challenge (`/#challenge`, `/daily`, `/try`)

15. **Today’s word** (UTC) on dark canvas — **no sign-in**.  
16. **0–100%** coverage bar; pass at **88%**; no **Check**; no **`user_progress`** save.  
17. **Signed in** — streak in **`user_daily_challenge`**; dashboard **Daily challenge** card. **Signed out** — sign-up CTA.  
18. Success CTAs: **signed-out** → **`MarketingAccessCTAs`** (**Start your first lesson** → **`/onboarding`**); **signed-in** → **`/lessons`**.

## Protected app (production)

19. **`/dashboard`**, **`/lessons`**, section hubs, and lesson URLs require sign-in (**`proxy.ts`**). **`/subscribe`** requires sign-in (else redirect to sign-in with return URL). **`/`**, **`/try`**, **`/daily`**, **`#challenge`**, **`/onboarding`** stay public.  
20. **Dashboard** — **Daily challenge** card, stats, unit cards; **Billing** when user has paid access (**lifetime** badge or monthly **Manage billing**).

### Billing gate (production, when Stripe env is complete)

When **`STRIPE_SECRET_KEY`**, **`STRIPE_LIFETIME_PRICE_ID`**, and **`STRIPE_MONTHLY_PRICE_ID`** are set **and** **`shouldEnforceSubscriptionAccess()`** is true, **`/lessons`** requires **`hasSubscriptionAccessForCurrentUser()`** — **`lifetime`**, **`active`/`trialing`**, or **`FREE_ACCESS_EMAILS`**. Else redirect **`/subscribe`**. **`/dashboard`** not paywalled. Homepage demo not paywalled.

### Vercel Preview and local development

Preview and localhost skip **`auth.protect()`** and subscription enforcement for QA. Progress save still needs Clerk **`userId`**. See **`lib/env/dev-access.ts`**.

### After Checkout

**Success** → **`/dashboard?checkout=success`**. **Cancel** → **`/?checkout=canceled`** (banner; links to **`#pricing`**). On **local dev**, cancel returns to **localhost** (not production) — **`resolveAppOrigin`** in **`lib/stripe/server.ts`**.

## Lessons overview

21. **`/lessons`** — four unit blocks with section cards.  
22. Section cards link to first incomplete lesson or section hub. **Challenge words** never locked.  
23. Tap unlocked card → **`/lessons/[lessonId]`** or section hub.

## Section hub

24. **`/lessons/sections/[sectionId]`** — Arabic-first lesson rows, **Continue**, **Next section** when complete.  
25. Tap unlocked row → lesson detail.

## Lesson detail (practice)

26. Canvas, **Check**, feedback panel.  
27. **Good** / **Excellent** → save progress → complete overlay → **Next** (section order).  
28. **Try again** — no save.

## Locked lesson / section

29. Locked lesson URL → **`/lessons`** (skipped on Preview/local bypass).  
30. Locked section entry → **`/lessons`** (challenge section always open).

## Completion (MVP)

31. No global “course complete”; progression through sections and units.
