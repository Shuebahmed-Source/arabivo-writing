import { getLessonById } from "@/lib/lessons";

/** Featured on `/` and `/try` — handoff landing challenge word. */
export const HOMEPAGE_DEMO_LESSON_ID = "word-qalam";

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
    hookLine: "Three letters. One word for pen.",
    revealLine:
      "Qāf, lām, and mīm — a real Arabic word you can write by hand, not just read.",
  };
}
