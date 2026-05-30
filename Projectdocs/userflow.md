# User Flow

**Production:** This flow matches **`write.arabivo.net`** (or your live host) built from **`main`**. **Preview** URLs may skip sign-in on **`/lessons`** for testing only — see **`features.md`**.

## Entry

1. User visits **`/`** (landing) — hero, **`#try`** demo, features, and **`#pricing`**.  
2. **`/try`** — same demo as **`/#try`**, minimal page for external links (bio, ads).  
3. **`/subscribe`** — After sign-in, shows a **plan summary page** (price from Stripe, trial copy from **`STRIPE_TRIAL_PERIOD_DAYS`**), then **Continue** calls **`POST /api/checkout`** and redirects to Stripe. Not an instant redirect-only route.

4. **Primary CTA** (hero, pricing, and marketing header): signed-out label from **`primaryTrialCtaLabel`** — **`Start 3-Day Free Trial`** when **`STRIPE_TRIAL_PERIOD_DAYS`** is **3**, **`Start 7-Day Free Trial`** when **7**, **`Start Free Trial`** for other **n > 0**, else **`Start your free trial`** (set **`STRIPE_TRIAL_PERIOD_DAYS`** on Vercel so production matches local trial copy). Signed-out users go to **`/sign-up`** or **`/sign-in`** with **`redirect_url=/subscribe`**, then **`/subscribe`** (plan page) → **Stripe Checkout**. Signed-in users use **`Start your free trial`** → **`/subscribe`** (plan page) → **Stripe**. Session for first paint comes from server **`auth()`** (`initialSignedIn`) so the hero does not flash the signed-out layout while Clerk loads.  
5. **Hero secondary:** **try a challenge word free** → scroll to **`#try`** (no account).  
6. Generic visits to **`/sign-in`** / **`/sign-up`** without **`redirect_url`** still use Clerk’s fallback **`/dashboard`** (root layout).  

**Note:** The marketing header links to **`/try`**, **`#pricing`**, and sign-in; the in-app header (after sign-in) links to **`/dashboard`** and **`/lessons`**.

## Public demo (`/#try` and `/try`)

7. User sees **ششش** (three shīn) with a live tracing canvas — **no sign-in**.  
8. User traces, taps **Check** → **Excellent**, **Good**, or **Try again** (inline panel; no Supabase save).  
9. On **Good** / **Excellent**:  
   - **Signed out** — meaning reveal + **`TrialFunnelCTAs`** (start trial / sign in).  
   - **Signed in** — meaning reveal + **See all challenge words** → **`/lessons/sections/challenge-words-core`**.  
10. **See all challenge words** in production with billing enforced: requires **active/trialing** subscription (or **`FREE_ACCESS_EMAILS`**); otherwise redirect to **`/subscribe`**. Account alone is not enough.

## Protected app (production)

11. **`/dashboard`**, **`/lessons`**, **`/lessons/sections/*`**, and **`/lessons/[lessonId]`** require sign-in via Clerk **`proxy.ts`** (**`auth.protect()`**). **`/subscribe`** is public (unauthenticated users are redirected to sign-in). **`/`** and **`/try`** remain public.  
12. **Dashboard** — **four** units, **completed / total** per unit, progress bars, **Locked** until the first lesson of that unit is reachable under **section** rules — **except Challenge words**, which is always **Available**; **Billing** (manage portal) only when the user already has an **active** or **trialing** subscription. No subscribe sales card on the dashboard.  

### Billing gate (production, when Stripe env is complete)

If **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are set **and** **`shouldEnforceSubscriptionAccess()`** is true (**Vercel Production**), **`/lessons`** and nested lesson URLs require subscription access (**`hasSubscriptionAccessForCurrentUser()`** — Stripe **active/trialing** or **`FREE_ACCESS_EMAILS`**). Otherwise the app redirects to **`/subscribe`**. **`/dashboard`** is not paywalled. If Stripe env is incomplete, lessons are not paywalled. Saving progress uses the same subscription check when enforcement is on. The **homepage demo** is **not** paywalled.

### Vercel Preview and local development

For **Preview** (`VERCEL_ENV=preview`), **`next dev`**, or **localhost** / **127.0.0.1** (`next start`), the app **skips** learn-route **`auth.protect()`** and subscription enforcement so **`/lessons`** and lesson URLs are usable without sign-in for UI/flow testing. **Progress save** still requires a Clerk **`userId`**. See **`lib/env/dev-access.ts`** and **`Projectdocs/features.md`**.  

### After Checkout

Successful payment returns to **`/dashboard?checkout=success`**. Canceled Checkout returns to **`/?checkout=canceled`** (homepage banner; viewport stays at top).

## Lessons overview

13. **`/lessons`** — for each unit, a short description and a **grid of section cards**: **Letters I–V**, one **Letter forms** card, **seven** cards under **Simple words**, and **Can you write this?** under **Challenge words** (see **`context.md`** for section ids).  
14. Each card shows **progress** (e.g. 3/5), **Locked** until the section is unlocked, or **Done** when every item in the section is completed. **Challenge words** section is never locked.  
15. User taps an unlocked section → **`/lessons/sections/[sectionId]`**.  

## Section hub

16. Section page shows the **section title**, **Continue** (first incomplete lesson that is unlocked), item list with **Done** / **Locked**, and **Next section** when the section is fully complete. In **open** sections (challenge), all items are unlocked from the start — **Continue** picks the first incomplete.  
17. User can open any **unlocked** item → **`/lessons/[lessonId]`**.  

## Lesson detail (practice)

18. **Back to section** returns to **`/lessons/sections/[sectionId]`**.  
19. Page shows unit · **section link**, lesson title, type badge (**CHALLENGE · TRACE** for challenge items), **Completed** if already saved, Arabic, transliteration, meaning.  
20. **Practice writing** — canvas with faint guide; user traces with finger, stylus, or mouse.  
21. User taps **Check**.  
22. Feedback appears: **Excellent**, **Good**, or **Try again** (inline panel).  

### If Good or Excellent

23. Progress is **saved** to Supabase (upsert per `clerk_user_id` + `lesson_id`).  
24. **Lesson complete** full-screen overlay appears (animated): section title, **x/y** progress bar, short lesson title, result line, faint Arabic watermark, **Practice again** (close overlay, clear canvas) or **Next** — navigates to the **next lesson in the same section** in order (including replay when later lessons are already complete); after the **last** lesson in the section, **`Next`** goes to **`/lessons/sections/[sectionId]`** for that section (**`getPostCompletionPath`** in **`lib/progress/post-completion.ts`**).  
25. User can still **Practice again** on the same lesson later; **best_result** does not downgrade (e.g. **excellent** kept over **good**).  

### If Try again

26. No save; user may **Clear** and retry.  

## Locked lesson

27. If the user opens a locked lesson URL, the app **redirects to `/lessons`** (skipped when Preview/local dev bypass is active — see **Protected app**). Open-section challenge lessons are never locked.

## Locked section

28. If the user opens a section whose **first lesson** is not unlocked, the app **redirects to `/lessons`** (skipped when Preview/local dev bypass is active). **Challenge words** section entry is always unlocked.

## Completion (MVP)

29. There is no single global “course complete” finale; progression continues through **sections** and **units**. After the **final lesson in a section**, **Next** returns to that **section hub**; from there the learner can pick another section or return to **`/lessons`**. Challenge items can be done in any order and do not gate the main curriculum.
