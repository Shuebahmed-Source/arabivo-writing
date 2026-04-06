-- Stripe subscription snapshot per Clerk user (updated via webhooks + service role).

create table if not exists public.user_subscriptions (
  clerk_user_id text primary key,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists user_subscriptions_stripe_subscription_id_idx
  on public.user_subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

comment on table public.user_subscriptions is 'Stripe subscription; clerk_user_id matches Clerk userId.';

alter table public.user_subscriptions enable row level security;
