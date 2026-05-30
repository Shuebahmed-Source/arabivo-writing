import { getLessonById } from "@/lib/lessons";

/** Featured on `/` and `/try` — maximum visual punch, same as the challenge lesson. */
export const HOMEPAGE_DEMO_LESSON_ID = "challenge-shin-triple";

export type HomepageDemoChallenge = {
  lessonId: string;
  arabicText: string;
  transliteration: string;
  englishMeaning: string;
  hookLine: string;
  revealLine: string;
};

export function getHomepageDemoChallenge(): HomepageDemoChallenge {
  const lesson = getLessonById(HOMEPAGE_DEMO_LESSON_ID);
  if (!lesson) {
    throw new Error(`Demo lesson not found: ${HOMEPAGE_DEMO_LESSON_ID}`);
  }

  return {
    lessonId: lesson.id,
    arabicText: lesson.arabicText,
    transliteration: lesson.transliteration,
    englishMeaning: lesson.englishMeaning,
    hookLine: "Nine dots. Three teeth. One shape.",
    revealLine:
      "Three shīn letters in a row — not a vocabulary word, but real Arabic script. Looks impossible until you trace it.",
  };
}
