import { addUtcDays, utcDateKey } from "./dates";
import type { DailyChallengeStreak } from "./types";

/**
 * Consecutive UTC calendar days with a completion, counting back from today
 * (if completed today) or from yesterday (grace until today ends).
 */
export function computeDailyChallengeStreak(
  completionDateKeys: string[],
  todayKey: string = utcDateKey(),
): DailyChallengeStreak {
  const completed = new Set(completionDateKeys);
  const completedToday = completed.has(todayKey);

  let cursor = completedToday ? todayKey : addUtcDays(todayKey, -1);
  if (!completed.has(cursor)) {
    return { currentStreak: 0, completedToday };
  }

  let currentStreak = 0;
  while (completed.has(cursor)) {
    currentStreak++;
    cursor = addUtcDays(cursor, -1);
  }

  return { currentStreak, completedToday };
}
