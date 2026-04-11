# Supabase — production setup (ArabivoWrite)

The app stores lesson completion in **`public.user_progress`**. The server uses the **service role** key only after Clerk verifies the user (see `lib/supabase/admin.ts`). **RLS is enabled** with no policies for anon/authenticated — the service role bypasses RLS when used from trusted server code.

**Live app:** Vercel **Production** for **`main`** must include **`NEXT_PUBLIC_SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** so lesson pages and dashboard can load progress; failures surface in logs via **`lib/progress/queries.ts`** (see **`database.md`**).  

## 1. Create or choose a project

1. Open [Supabase Dashboard](https://supabase.com/dashboard).  
2. **New project** (or use an existing **production** project).  
3. Pick region, set a database password, wait until the project is **healthy**.

Use **one project** for production (Vercel). You can use the **same** project from local `.env.local` if you want local dev to hit production data, or create a **separate** dev project and keep test keys in `.env.local` only — your choice.

## 2. Run migrations (`user_progress` + `user_subscriptions`)

In the project: **SQL Editor** → **New query** for each file, **Run**, confirm no errors.

1. **`supabase/migrations/20260403120000_user_progress.sql`** — lesson completion.  
2. **`supabase/migrations/20260405120000_user_subscriptions.sql`** — Stripe subscription snapshot for dashboard + paywall.

`CREATE TABLE IF NOT EXISTS` is safe to run again if you are unsure whether a migration was already applied.

## 3. Copy API credentials

1. **Project Settings** (gear) → **API**.  
2. Copy:

   | Vercel / env name | Where in Supabase |
   |-------------------|-------------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon** `public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | **service_role** `secret` (server-only) |

Never commit **`SUPABASE_SERVICE_ROLE_KEY`** or put it in client-side code.

## 4. Vercel (Production and Preview)

1. **Vercel** → your project → **Settings** → **Environment Variables**.  
2. For **Production**, set the three variables above (same names as in **`.env.example`**).  
3. For **Preview**, add the same variables if you want **progress saves** and subscription reads to work on branch deploys (still requires **Clerk `userId`** for writes). Preview deploys otherwise may run lessons UI with bypasses documented in **`features.md`**.  
4. **Save**, then **Redeploy** (or trigger a new deploy) so the app picks up the values.

## 5. Local `.env.local` (optional alignment)

If you want **`npm run dev`** to use the **same** Supabase project as production:

- Put the **same** three values in **`.env.local`** as in Vercel Production.

If you use a **separate** dev Supabase project, keep dev URLs/keys in **`.env.local`** and production keys **only** in Vercel.

## 6. Verify

1. Open your **deployed** app (or localhost with matching env).  
2. Sign in with Clerk → complete a lesson with **Good** or **Excellent** (requires subscription if Stripe billing env is fully configured on the deployment).  
3. In Supabase: **Table Editor** → **`user_progress`** — new row with `clerk_user_id` and `lesson_id`.  
4. After a successful Stripe Checkout (and webhook), check **`user_subscriptions`** for a row with **`active`** or **`trialing`** status.

If saving fails, check Vercel logs and the in-app error string (the app surfaces common misconfigurations).

## 7. Stripe

Not stored in Supabase auth — see **`Projectdocs/stripe.md`** for env vars, webhook URL, and the **`user_subscriptions`** migration.
