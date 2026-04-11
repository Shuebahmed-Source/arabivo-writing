# User Flow

**Production:** This flow matches **`write.arabivo.net`** (or your live host) built from **`main`**. **Preview** URLs may skip sign-in on **`/lessons`** for testing only — see **`features.md`**.

## Entry

1. User visits **`/`** (landing) — hero, features, and **`#pricing`**.  
2. **`/subscribe`** — After sign-in, shows a **plan summary page** (price from Stripe, trial copy from **`STRIPE_TRIAL_PERIOD_DAYS`**), then **Continue** calls **`POST /api/checkout`** and redirects to Stripe. Not an instant redirect-only route.

3. **Primary CTA** (hero, pricing, and marketing header): signed-out label from **`primaryTrialCtaLabel`** — **`Start 3-Day Free Trial`** when **`STRIPE_TRIAL_PERIOD_DAYS`** is **3**, **`Start 7-Day Free Trial`** when **7**, **`Start Free Trial`** for other **n > 0**, else **`Start your free trial`** (set **`STRIPE_TRIAL_PERIOD_DAYS`** on Vercel so production matches local trial copy). Signed-out users go to **`/sign-up`** or **`/sign-in`** with **`redirect_url=/subscribe`**, then **`/subscribe`** (plan page) → **Stripe Checkout**. Signed-in users use **`Start your free trial`** → **`/subscribe`** (plan page) → **Stripe**. Session for first paint comes from server **`auth()`** (`initialSignedIn`) so the hero does not flash the signed-out layout while Clerk loads.  
4. Generic visits to **`/sign-in`** / **`/sign-up`** without **`redirect_url`** still use Clerk’s fallback **`/dashboard`** (root layout).  

**Note:** The marketing header links to **`#pricing`**; the in-app header (after sign-in) links to **`/dashboard`** and **`/lessons`**.

## Protected app (production)

5. **`/dashboard`**, **`/lessons`**, **`/lessons/sections/*`**, and **`/lessons/[lessonId]`** require sign-in via Clerk **`proxy.ts`** (**`auth.protect()`**). **`/subscribe`** is public (unauthenticated users are redirected to sign-in).  
6. **Dashboard** — three units, **completed / total** per unit, progress bars, **Locked** until the first lesson of that unit is reachable under **section** rules; **Billing** (manage portal) only when the user already has an **active** or **trialing** subscription. No subscribe sales card on the dashboard.  

### Billing gate (production, when Stripe env is complete)

If **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are set **and** **`shouldEnforceSubscriptionAccess()`** is true (**Vercel Production**), **`/lessons`** and nested lesson URLs require subscription access (**`hasSubscriptionAccessForCurrentUser()`** — Stripe **active/trialing** or **`FREE_ACCESS_EMAILS`**). Otherwise the app redirects to **`/subscribe`**. **`/dashboard`** is not paywalled. If Stripe env is incomplete, lessons are not paywalled. Saving progress uses the same subscription check when enforcement is on.

### Vercel Preview and local development

For **Preview** (`VERCEL_ENV=preview`), **`next dev`**, or **localhost** / **127.0.0.1** (`next start`), the app **skips** learn-route **`auth.protect()`** and subscription enforcement so **`/lessons`** and lesson URLs are usable without sign-in for UI/flow testing. **Progress save** still requires a Clerk **`userId`**. See **`lib/env/dev-access.ts`** and **`Projectdocs/features.md`**.  

### After Checkout

Successful payment returns to **`/dashboard?checkout=success`**. Canceled Checkout returns to **`/?checkout=canceled`** (homepage banner; viewport stays at top).

## Lessons overview

7. **`/lessons`** — for each unit, a short description and a **grid of section cards** (e.g. Letters I–V, then single sections for letter forms and words).  
8. Each card shows **progress** (e.g. 3/5), **Locked** until the section is unlocked, or **Done** when every item in the section is completed.  
9. User taps an unlocked section → **`/lessons/sections/[sectionId]`**.  

## Section hub

10. Section page shows the **section title**, **Continue** (first incomplete lesson that is unlocked), item list with **Done** / **Locked**, and **Next section** when the section is fully complete.  
11. User can open any **unlocked** item → **`/lessons/[lessonId]`**.  

## Lesson detail (practice)

12. **Back to section** returns to **`/lessons/sections/[sectionId]`**.  
13. Page shows unit · **section link**, lesson title, type badge, **Completed** if already saved, Arabic, transliteration, meaning.  
14. **Practice writing** — canvas with faint guide; user traces with finger, stylus, or mouse.  
15. User taps **Check**.  
16. Feedback appears: **Excellent**, **Good**, or **Try again** (inline panel).  

### If Good or Excellent

17. Progress is **saved** to Supabase (upsert per `clerk_user_id` + `lesson_id`).  
18. **Lesson complete** full-screen overlay appears (animated): section title, **x/y** progress bar, short lesson title, result line, faint Arabic watermark, **Practice again** (close overlay, clear canvas) or **Next** — navigates to the **next lesson in the same section** in order (including replay when later lessons are already complete); after the **last** lesson in the section, **`Next`** goes to **`/lessons/sections/[sectionId]`** for that section (**`getPostCompletionPath`** in **`lib/progress/post-completion.ts`**).  
19. User can still **Practice again** on the same lesson later; **best_result** does not downgrade (e.g. **excellent** kept over **good**).  

### If Try again

20. No save; user may **Clear** and retry.  

## Locked lesson

21. If the user opens a locked lesson URL, the app **redirects to `/lessons`** (skipped when Preview/local dev bypass is active — see **Protected app**).  

## Locked section

22. If the user opens a section whose **first lesson** is not unlocked, the app **redirects to `/lessons`** (skipped when Preview/local dev bypass is active).  

## Completion (MVP)

23. There is no single global “course complete” finale; progression continues through **sections** and **units**. After the **final lesson in a section**, **Next** returns to that **section hub**; from there the learner can pick another section or return to **`/lessons`**.  
