import { auth } from "@clerk/nextjs/server";

import { utcDateKey } from "@/lib/daily-challenge/dates";
import { computeDailyChallengeStreak } from "@/lib/daily-challenge/streak";
import type { DailyChallengeStreak } from "@/lib/daily-challenge/types";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export async function fetchDailyChallengeDateKeysForUser(
  userId: string,
): Promise<string[]> {
  if (!isSupabaseAdminConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_daily_challenge")
    .select("challenge_date")
    .eq("clerk_user_id", userId)
    .order("challenge_date", { ascending: false });

  if (error) {
    console.error("[fetchDailyChallengeDateKeysForUser]", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const raw = row.challenge_date as string;
    return raw.slice(0, 10);
  });
}

export async function getDailyChallengeStreakForCurrentUser(): Promise<DailyChallengeStreak | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const dateKeys = await fetchDailyChallengeDateKeysForUser(userId);
  return computeDailyChallengeStreak(dateKeys, utcDateKey());
}

export async function hasCompletedDailyChallengeTodayForCurrentUser(): Promise<boolean> {
  const streak = await getDailyChallengeStreakForCurrentUser();
  return streak?.completedToday ?? false;
}
