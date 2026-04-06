-- MVP lesson completion per Clerk user. lesson_id matches ids in lib/lessons.ts (local curriculum).
-- Access from the app uses the Supabase service role on the server only.

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  lesson_id text not null,
  completed boolean not null default true,
  completed_at timestamptz,
  best_result text not null check (best_result in ('excellent', 'good')),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, lesson_id)
);

create index if not exists user_progress_clerk_user_id_idx
  on public.user_progress (clerk_user_id);

comment on table public.user_progress is 'Per-lesson completion; clerk_user_id matches Clerk userId.';

alter table public.user_progress enable row level security;
