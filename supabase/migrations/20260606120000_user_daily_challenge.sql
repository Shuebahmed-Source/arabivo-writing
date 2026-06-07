-- Daily challenge completions (separate from curriculum user_progress).
-- challenge_date is UTC calendar day (YYYY-MM-DD).

CREATE TABLE IF NOT EXISTS public.user_daily_challenge (
  clerk_user_id text NOT NULL,
  challenge_date date NOT NULL,
  lesson_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (clerk_user_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS user_daily_challenge_clerk_user_id_idx
  ON public.user_daily_challenge (clerk_user_id);

COMMENT ON TABLE public.user_daily_challenge IS
  'Daily trace challenge pass per UTC day; streaks derive from consecutive dates.';

ALTER TABLE public.user_daily_challenge ENABLE ROW LEVEL SECURITY;
