# User Flow

## Entry

1. User visits **`/`** (landing) — hero, features, and **`#pricing`**.  
2. **Primary CTA** (hero, pricing, and marketing header): signed-out label from **`primaryTrialCtaLabel`** — **`Start 3-Day Free Trial`** when **`STRIPE_TRIAL_PERIOD_DAYS`** is **3**, **`Start Free Trial`** for other **n > 0**, else **`Subscribe`**. Signed-out users go to **`/sign-up`** or **`/sign-in`** with **`redirect_url=/subscribe`**, then **`/subscribe`** → **Stripe Checkout**. Signed-in users see **`Start your free trial`** → **`/subscribe`**. Session for first paint comes from server **`auth()`** (`initialSignedIn`) so the hero does not flash the signed-out layout while Clerk loads.  
3. Generic visits to **`/sign-in`** / **`/sign-up`** without **`redirect_url`** still use Clerk’s fallback **`/dashboard`** (root layout).  

**Note:** The marketing header links to **`#pricing`**; the in-app header (after sign-in) links to **`/dashboard`** and **`/lessons`**.

## Protected app

4. **`/dashboard`**, **`/lessons`**, **`/lessons/sections/*`**, and **`/lessons/[lessonId]`** require sign-in (Clerk **`proxy.ts`**). **`/subscribe`** is public (it redirects unauthenticated users to sign-in).  
5. **Dashboard** — three units, **completed / total** per unit, progress bars, **Locked** until the first lesson of that unit is reachable under **section** rules; **Billing** (manage portal) only when the user already has an **active** or **trialing** subscription. No subscribe sales card on the dashboard.  

### Billing gate (when Stripe env is complete)

If **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are set on the deployment, **`/lessons`** and all nested lesson URLs require a Stripe subscription in **`active`** or **`trialing`** status (synced to **`user_subscriptions`**). Otherwise the app sends the user to **`/subscribe`** (which sends them into Checkout if signed in, or through auth first if not). **`/dashboard`** itself is not paywalled. If Stripe env is **not** complete, lessons behave as before (signed-in users only). Saving progress uses the same subscription check when billing is on.

### After Checkout

Successful payment returns to **`/dashboard?checkout=success`**. Canceled Checkout returns to **`/?checkout=canceled`** (homepage banner; viewport stays at top).

## Lessons overview

6. **`/lessons`** — for each unit, a short description and a **grid of section cards** (e.g. Letters I–V, then single sections for letter forms and words).  
7. Each card shows **progress** (e.g. 3/5), **Locked** until the section is unlocked, or **Done** when every item in the section is completed.  
8. User taps an unlocked section → **`/lessons/sections/[sectionId]`**.  

## Section hub

9. Section page shows the **section title**, **Continue** (first incomplete lesson that is unlocked), item list with **Done** / **Locked**, and **Next section** when the section is fully complete.  
10. User can open any **unlocked** item → **`/lessons/[lessonId]`**.  

## Lesson detail (practice)

11. **Back to section** returns to **`/lessons/sections/[sectionId]`**.  
12. Page shows unit · **section link**, lesson title, type badge, **Completed** if already saved, Arabic, transliteration, meaning.  
13. **Practice writing** — canvas with faint guide; user traces with finger, stylus, or mouse.  
14. User taps **Check**.  
15. Feedback appears: **Excellent**, **Good**, or **Try again** (inline panel).  

### If Good or Excellent

16. Progress is **saved** to Supabase (upsert per `clerk_user_id` + `lesson_id`).  
17. **Lesson complete** full-screen overlay appears (animated): section title, **x/y** progress bar, short lesson title, result line, faint Arabic watermark, **Practice again** (close overlay, clear canvas) or **Next** (navigate to the next lesson, next section hub, or **`/lessons`** per server rules).  
18. User can still **Practice again** on the same lesson later; **best_result** does not downgrade (e.g. **excellent** kept over **good**).  

### If Try again

19. No save; user may **Clear** and retry.  

## Locked lesson

20. If the user opens a locked lesson URL, the app **redirects to `/lessons`**.  

## Locked section

21. If the user opens a section whose **first lesson** is not unlocked, the app **redirects to `/lessons`**.  

## Completion (MVP)

22. There is no single global “course complete” finale; progression continues through **sections** and **units**. The last **Next** from the final item returns to **`/lessons`** when there is no further section.  
