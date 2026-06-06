import {
  countArabicLetters,
  guideFontSizeRatio,
} from "@/lib/writing/lesson-display";

/** Large guides for short onboarding traces; shrink only for long strings. */
export function onboardingTraceFontSize(
  width: number,
  height: number,
  glyph: string,
): number {
  const letters = countArabicLetters(glyph);
  if (letters <= 6) {
    return Math.min(height * 0.82, width * 0.6);
  }
  return Math.min(
    height * 0.78,
    width * 0.92,
    Math.min(width, height) * guideFontSizeRatio(glyph) * 1.25,
  );
}
