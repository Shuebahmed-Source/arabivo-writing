# Features

**Live product:** **`main`** is deployed to **Vercel Production** (e.g. **`write.arabivo.net`**). Learners get **Clerk + Stripe paywall** as documented below; **section replay** (**Next** in order through completed sections) and related fixes ship on that same branch. **Preview** / **local** bypasses exist only for QA — they do **not** apply when **`VERCEL_ENV=production`**.

## Authentication (Clerk)

- Sign up and sign in (`/sign-up`, `/sign-in`)  
- **Production:** **`/dashboard`**, **`/lessons`**, lesson URLs, and **section URLs** require authentication via **`proxy.ts`** (Clerk **`auth.protect()`** on those paths).  
- **Vercel Preview + local dev:** the same routes can be opened **without** sign-in when **`isPreviewOrLocalDevBypassFromRequest`** / **`isPreviewOrLocalDevBypassServer()`** is true (**`lib/env/dev-access.ts`**): **`VERCEL_ENV=preview`**, or **`NODE_ENV=development`**, or **localhost** / **127.0.0.1** with no `VERCEL_ENV`. **Production** (`VERCEL_ENV=production` on Vercel) is unchanged.  
- Marketing home **`/`** stays public  
- **`ClerkProvider`** sets sign-in/up paths and fallback redirects to **`/dashboard`** (see **`.env.example`** for optional `NEXT_PUBLIC_CLERK_*` URL variables). **`/sign-in`** and **`/sign-up`** accept **`?redirect_url=`** (internal path only) so pricing CTAs can continue to **`/subscribe`** after auth.  
- **Production + Stripe billing configured:** users without subscription access who open **`/lessons`** are redirected to **`/subscribe`** (unless **`FREE_ACCESS_EMAILS`** matches — see **`stripe.md`**). Preview/local may skip both subscription enforcement and learn-route auth (see below).  

## Learning path

- **Local curriculum** in **`lib/lessons.ts`** — units, **sections** (metadata + ordered `lessonIds`), and **lessons** with `sectionId`; not stored in Supabase yet  
- **Section-based unlocking** (see `lib/progress/unlock.ts`):  
  - First item of the first section is open by default  
  - Sequential completion **within** each section  
  - **Full section** completion required before the **next section** unlocks  
- **Three units**: Arabic letters (five sections), letter forms (one section), simple words (seven sections)  
- **`/lessons`** — per-unit headings and **section cards** (progress fraction, Locked / Done, link when the section’s first lesson is reachable)  
- **`/lessons/sections/[sectionId]`** — section hub: item list, **Continue** to the first incomplete unlocked lesson, **Next section** when the section is complete  
- **`/lessons/[lessonId]`** — practice page; **Back to section** returns to the section hub  
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

## Scoring and feedback

- Outcomes: **Excellent**, **Good**, **Try again**  
- Thresholds in **`components/writing/score-user-trace.ts`** are tuned for beginners (relaxed coverage/precision and off-guide caps vs earlier stricter defaults); still pixel-overlap based, not OCR  
- Inline **WritingFeedbackPanel** after **Check** (headline + coaching copy) for all outcomes  
- On **Good** / **Excellent**, **progress save** (server action + Supabase) then **Lesson complete overlay** (Framer Motion): staggered entrance, animated section progress bar, **deterministic icon + tint per `lessonId`**, **Practice again** or **Next**  

## Progress and dashboard

- **`user_progress`** in Supabase: `clerk_user_id`, `lesson_id`, `completed`, `completed_at`, `best_result` (`excellent` | `good`) — **no** `section_id` column; sections are derived in app code  
- **`user_subscriptions`** in Supabase: Stripe subscription snapshot (`status`, `current_period_end`, etc.) — updated via **`/api/webhooks/stripe`**; landing **`#pricing`** + **`/subscribe`** start checkout; dashboard shows **Billing** (portal) **only** for **active** / **trialing** users when Stripe env vars are set; **`/lessons`** requires **`active`** or **`trialing`** subscription **in production** when billing is configured (see **`Projectdocs/stripe.md`**; Preview/local may bypass enforcement)  
- **Checkout feedback:** `?checkout=success` on dashboard after payment; **`?checkout=canceled`** or **`?checkout=failed`** on **`/`** (banner at top; no URL hash so the page does not jump to **`#pricing`**)  
- **Dashboard**: per-unit **completed / total** and progress bar; unit **Locked** until the **first lesson of that unit** is reachable under section rules  
- **Post-save navigation** (`getPostCompletionPath`): after save, **Next** goes to the **next lesson in section order** (even if already completed, for replay); after the **last** lesson in the section, **`/lessons/sections/[sectionId]`** for that section (not auto-advance to the next section)  

## Responsive design

- Mobile-first layout, large tap targets, route groups for marketing vs learn chrome  
- Canvas stroke data uses **normalized coordinates** so ink survives resize reasonably well  

## Not in scope yet

- Lesson rows in Supabase  
- Per-attempt history, streaks, analytics  
- `users` sync table in DB (progress keyed by Clerk `userId` only)  
- Numbers unit and extended connection curriculum (optional future)  
