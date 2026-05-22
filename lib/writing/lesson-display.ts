import type { LessonType } from "@/lib/lessons";

/** Uppercase label for the practice screen header (e.g. WORD · TRACE). */
export function practiceKindLabel(type: LessonType): string {
  if (type === "word") return "WORD · TRACE";
  if (type === "letter_form") return "FORM · TRACE";
  return "LETTER · TRACE";
}

/** Count Arabic letters in lesson text (spaces and common diacritics excluded). */
export function countArabicLetters(arabicText: string): number {
  const stripped = arabicText.replace(
    /[\s\u0640\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
    "",
  );
  return [...stripped].length;
}

export function formatBestResult(
  value: string | undefined,
): "Excellent" | "Good" | null {
  if (value === "excellent") return "Excellent";
  if (value === "good") return "Good";
  return null;
}
