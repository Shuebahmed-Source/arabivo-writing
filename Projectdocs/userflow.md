# User Flow

## Entry

1. User visits **`/`** (landing).  
2. User chooses **Start learning** (sign up) or **Sign in**.  
3. After auth, Clerk may return to the requested URL or home.  

**Note:** The marketing header on **`/`** does not link to lessons. To practice, open **`/lessons`** or **`/dashboard`** manually (or set Clerk’s post-sign-in redirect to one of those paths in the Clerk dashboard).

## Protected app

4. **`/dashboard`**, **`/lessons`**, **`/lessons/sections/*`**, and **`/lessons/[lessonId]`** require sign-in (Clerk **`proxy.ts`**).  
5. **Dashboard** — three units, **completed / total** per unit, progress bars, **Locked** until the first lesson of that unit is reachable under **section** rules; **Subscribe** / **Manage billing** when Stripe is configured; banner when **`?subscribe=required`** (user tried **lessons** without an active or trialing subscription).  

### Billing gate (when Stripe env is complete)

If **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are set on the deployment, **`/lessons`** and all nested lesson URLs require a Stripe subscription in **`active`** or **`trialing`** status (synced to **`user_subscriptions`**). Otherwise the app sends the user to **`/dashboard?subscribe=required`**. **`/dashboard`** itself is not paywalled. If Stripe env is **not** complete, lessons behave as before (signed-in users only). Saving progress uses the same subscription check when billing is on.

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
