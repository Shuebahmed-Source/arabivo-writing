"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { utcDateKey } from "@/lib/daily-challenge/dates";
import { getDailyChallenge } from "@/lib/daily-challenge/get-daily-challenge";
import { fetchDailyChallengeDateKeysForUser } from "@/lib/daily-challenge/queries";
import { computeDailyChallengeStreak } from "@/lib/daily-challenge/streak";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export type RecordDailyChallengeResult =
  | { ok: true; currentStreak: number; completedToday: true }
  | { ok: false; message: string };

function mapSupabaseError(err: { message?: string; code?: string }): string {
  const msg = (err.message ?? "").toLowerCase();
  const code = err.code ?? "";

  if (
    msg.includes("does not exist") ||
    code === "42P01" ||
    (msg.includes("relation") && msg.includes("user_daily_challenge"))
  ) {
    return "Database table user_daily_challenge is missing. Run supabase/migrations/20260606120000_user_daily_challenge.sql on your Supabase project.";
  }

  if (process.env.NODE_ENV === "development") {
    return `Could not save daily challenge: ${err.message ?? "unknown error"}`;
  }

  return "Could not save your streak. Try again.";
}

export async function recordDailyChallengeCompletion(
  challengeDate: string,
  lessonId: string,
): Promise<RecordDailyChallengeResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Sign in to save your daily streak." };
  }

  const today = getDailyChallenge();
  if (challengeDate !== today.challengeDate) {
    return { ok: false, message: "This challenge is no longer today’s word." };
  }
  if (lessonId !== today.lessonId) {
    return { ok: false, message: "Lesson does not match today’s challenge." };
  }
  if (challengeDate !== utcDateKey()) {
    return { ok: false, message: "Only today’s challenge can be saved." };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      message: "Streak saving is not configured on this environment.",
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("user_daily_challenge").upsert(
      {
        clerk_user_id: userId,
        challenge_date: challengeDate,
        lesson_id: lessonId,
        completed_at: now,
      },
      { onConflict: "clerk_user_id,challenge_date" },
    );

    if (error) {
      console.error("[recordDailyChallengeCompletion]", error);
      return { ok: false, message: mapSupabaseError(error) };
    }

    const dateKeys = await fetchDailyChallengeDateKeysForUser(userId);
    const { currentStreak } = computeDailyChallengeStreak(
      dateKeys,
      utcDateKey(),
    );

    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/daily");

    return { ok: true, currentStreak, completedToday: true };
  } catch (e) {
    console.error("[recordDailyChallengeCompletion]", e);
    return { ok: false, message: "Could not save your streak. Try again." };
  }
}
