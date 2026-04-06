# Database Structure

## Implemented (Supabase)

### `user_progress`

Stores **per-user, per-lesson completion** for the MVP. Tied to **Clerk** via `clerk_user_id` (Clerk `userId` string). **`lesson_id`** matches ids in **`lib/lessons.ts`** (stable slugs such as `alif-isolated`, `letters` sections, words, etc.).

**Sections and units are not stored here** — grouping (`sectionId`, unit) lives only in **`lib/lessons.ts`**. The app derives section progress by counting completed `lesson_id`s that belong to each section.

| Column           | Type         | Notes |
|-----------------|--------------|--------|
| `id`            | `uuid`       | Primary key, default `gen_random_uuid()` |
| `clerk_user_id` | `text`       | Clerk user id |
| `lesson_id`     | `text`       | Stable slug from local curriculum |
| `completed`     | `boolean`    | Default `true` for existing rows |
| `completed_at`  | `timestamptz`| Set on successful save |
| `best_result`   | `text`       | `'excellent'` or `'good'` (check constraint) |
| `updated_at`    | `timestamptz`| Default `now()` |

- **Unique** on `(clerk_user_id, lesson_id)` for upserts.  
- **Index** on `clerk_user_id`.  
- **RLS** enabled; **no** policies for JWT roles — app uses **service role** on the server only after Clerk session checks.  

**Migration file:** `supabase/migrations/20260403120000_user_progress.sql`

**Production setup (run SQL + Vercel env):** see **`Projectdocs/supabase-production.md`**.

### `user_subscriptions`

Snapshot of **Stripe** subscription state per Clerk user, updated from **webhooks** (and the same service-role server pattern as progress). Used for the dashboard **Subscribe** / **Manage billing** flow and for **paywall** checks on **`/lessons`** and **`recordLessonCompletion`** when Stripe billing env is configured (`active` / `trialing` allowed).

| Column                    | Type         | Notes |
|---------------------------|--------------|--------|
| `clerk_user_id`           | `text`       | Primary key; Clerk user id |
| `stripe_customer_id`      | `text`       | Stripe Customer id |
| `stripe_subscription_id`  | `text`       | Nullable |
| `status`                  | `text`       | Stripe subscription status (e.g. `active`, `canceled`) |
| `current_period_end`      | `timestamptz`| End of current billing period (when known) |
| `updated_at`              | `timestamptz`| Default `now()` |

- **RLS** enabled; **no** JWT policies — writes happen via **`SUPABASE_SERVICE_ROLE_KEY`** in trusted server code (webhooks + reads on dashboard).

**Migration file:** `supabase/migrations/20260405120000_user_subscriptions.sql`

**Stripe env + webhook:** see **`Projectdocs/stripe.md`**.

---

## Not implemented yet (future / original sketch)

These tables were part of an early product sketch or are optional. Lesson payloads live in code unless noted above.

### `users` (optional later)

Could mirror Clerk users for foreign keys or analytics. Currently **not** required because progress uses `clerk_user_id` directly.

### `lessons` / `lesson_items` / `sections` (optional later)

When content moves to Supabase, expect fields aligned with **`Lesson`** and **`SectionDefinition`** in `lib/lessons.ts` (e.g. `id`, `title`, `unit`, `section_id`, `order`, `arabic_text`, `transliteration`, `english_meaning`, `type`).

### `user_attempts` (optional later)

Per-check or per-stroke history — **explicitly out of scope** for the current MVP (no attempt logging yet).

---

## Score storage note

There is no separate **score** numeric column. **`best_result`** holds the best passing label for that lesson. **Try again** is not persisted.  

## Curriculum changes vs existing rows

If **`lesson_id`** values stay stable when the curriculum is edited, existing **`user_progress`** rows remain valid. Adding new lessons does not require a migration — only new completion rows as users finish those items.  
