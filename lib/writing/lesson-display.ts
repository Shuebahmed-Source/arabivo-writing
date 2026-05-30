import type { LessonType } from "@/lib/lessons";

/** Uppercase label for the practice screen header (e.g. WORD · TRACE). */
export function practiceKindLabel(type: LessonType): string {
  if (type === "challenge") return "CHALLENGE · TRACE";
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

/** Canvas guide font size as a fraction of min(width, height). Shorter strings stay large; long challenge words shrink to fit. */
export function guideFontSizeRatio(arabicText: string): number {
  const len = countArabicLetters(arabicText);
  if (len <= 3) return 0.42;
  if (len <= 5) return 0.38;
  if (len <= 8) return 0.32;
  if (len <= 12) return 0.26;
  if (len <= 16) return 0.2;
  return 0.14;
}

export function formatBestResult(
  value: string | undefined,
): "Excellent" | "Good" | null {
  if (value === "excellent") return "Excellent";
  if (value === "good") return "Good";
  return null;
}
