# Features

## Authentication (Clerk)

- Sign up and sign in (`/sign-up`, `/sign-in`)  
- **`/dashboard`**, **`/lessons`**, lesson URLs, and **section URLs** require authentication via **`proxy.ts`** (Clerk `auth.protect()` for the learn routes)  
- Marketing home **`/`** stays public  
- **`ClerkProvider`** sets sign-in/up paths and fallback redirects to **`/lessons`** (see **`.env.example`** for optional `NEXT_PUBLIC_CLERK_*` URL variables); users without a subscription are redirected from **`/lessons`** to **`/dashboard`** when Stripe billing env is configured  

## Learning path

- **Local curriculum** in **`lib/lessons.ts`** — units, **sections** (metadata + ordered `lessonIds`), and **lessons** with `sectionId`; not stored in Supabase yet  
- **Section-based unlocking** (see `lib/progress/unlock.ts`):  
  - First item of the first section is open by default  
  - Sequential completion **within** each section  
  - **Full section** completion required before the **next section** unlocks  
- **Three units**: Arabic letters (five sections), letter forms (one section), simple words (one section)  
- **`/lessons`** — per-unit headings and **section cards** (progress fraction, Locked / Done, link when the section’s first lesson is reachable)  
- **`/lessons/sections/[sectionId]`** — section hub: item list, **Continue** to the first incomplete unlocked lesson, **Next section** when the section is complete  
- **`/lessons/[lessonId]`** — practice page; **Back to section** returns to the section hub  
- Locked lesson URL → **redirect to `/lessons`**  

## Writing practice

- HTML **Canvas** with faint Arabic guide (same glyph as the lesson)  
- **Pointer-only** drawing (touch, stylus, mouse)  
- **Clear** — resets strokes and on-screen feedback (not saved progress)  
- **Check** — approximate scoring vs a hidden guide mask; **Try again** does not persist  

## Scoring and feedback

- Outcomes: **Excellent**, **Good**, **Try again**  
- Inline **WritingFeedbackPanel** after **Check** (headline + coaching copy) for all outcomes  
- On **Good** / **Excellent**, **progress save** (server action + Supabase) then **Lesson complete overlay** (Framer Motion): staggered entrance, animated section progress bar, **deterministic icon + tint per `lessonId`**, **Practice again** or **Next**  

## Progress and dashboard

- **`user_progress`** in Supabase: `clerk_user_id`, `lesson_id`, `completed`, `completed_at`, `best_result` (`excellent` | `good`) — **no** `section_id` column; sections are derived in app code  
- **`user_subscriptions`** in Supabase: Stripe subscription snapshot (`status`, `current_period_end`, etc.) — updated via **`/api/webhooks/stripe`**; dashboard shows **Subscribe** / **Manage billing** when Stripe env vars are set; **`/lessons`** requires **`active`** or **`trialing`** subscription (see **`Projectdocs/stripe.md`**)  
- **Checkout feedback:** `?checkout=success` / `?checkout=canceled` on dashboard; **`?subscribe=required`** when redirected from lessons without a subscription  
- **Dashboard**: per-unit **completed / total** and progress bar; unit **Locked** until the **first lesson of that unit** is reachable under section rules  
- **Post-save navigation** (`getPostCompletionPath`): next incomplete lesson in the same section when possible (skips items already in `user_progress`), else next section’s hub, else **`/lessons`**  

## Responsive design

- Mobile-first layout, large tap targets, route groups for marketing vs learn chrome  
- Canvas stroke data uses **normalized coordinates** so ink survives resize reasonably well  

## Not in scope yet

- Lesson rows in Supabase  
- Per-attempt history, streaks, analytics  
- `users` sync table in DB (progress keyed by Clerk `userId` only)  
- Numbers unit and extended connection curriculum (optional future)  
