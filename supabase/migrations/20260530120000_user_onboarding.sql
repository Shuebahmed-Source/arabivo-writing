-- Onboarding answers + demo completion (keyed by Clerk user id)

CREATE TABLE IF NOT EXISTS public.user_onboarding (
  clerk_user_id text PRIMARY KEY,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_trace_completed boolean NOT NULL DEFAULT false,
  first_trace_at timestamptz,
  demo_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_onboarding_demo_completed_idx
  ON public.user_onboarding (demo_completed_at)
  WHERE demo_completed_at IS NOT NULL;

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
