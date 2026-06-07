import { getLessonById } from "@/lib/lessons";

import { utcDateKey, utcDayNumber } from "./dates";
import { DAILY_CHALLENGE_POOL } from "./pool";
import type { DailyChallenge } from "./types";

function cleanMeaning(raw: string): string {
  const first = raw.split(";")[0]?.split("—")[0]?.trim() ?? raw;
  return first.replace(/^["“]|["”]$/g, "").trim();
}

function lessonIdForDate(date: Date): string {
  const index = utcDayNumber(date) % DAILY_CHALLENGE_POOL.length;
  return DAILY_CHALLENGE_POOL[index]!;
}

export function getDailyChallengeLessonId(date: Date = new Date()): string {
  return lessonIdForDate(date);
}

export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  const challengeDate = utcDateKey(date);
  const lessonId = lessonIdForDate(date);
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    throw new Error(`Daily challenge lesson not found: ${lessonId}`);
  }

  const meaning = cleanMeaning(lesson.englishMeaning);

  return {
    lessonId: lesson.id,
    arabicText: lesson.arabicText,
    transliteration: lesson.transliteration,
    englishMeaning: lesson.englishMeaning,
    hookLine: `Today’s word means ${meaning}.`,
    revealLine: `${lesson.transliteration} — ${meaning}`,
    challengeDate,
  };
}
