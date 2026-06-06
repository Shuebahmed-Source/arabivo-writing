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
  if (len <= 8) return 0.3;
  if (len <= 12) return 0.22;
  if (len <= 16) return 0.17;
  return 0.12;
}

export type GuideFontMetrics = {
  width: number;
  height: number;
};

/** Default visible ink stroke width on the practice canvas (CSS px). */
export const CANVAS_INK_LINE_WIDTH_PX = 10;

/**
 * Guide glyphs target this much larger than a tight canvas fit so ink blobs
 * don't fully hide the faint trace outline (dots + strokes).
 */
export const GUIDE_OVER_INK_SCALE = 1.14;

/** Approximate dot/counter size as a fraction of guide font size (Noto Naskh Arabic). */
const GUIDE_DOT_TO_FONT = 0.092;

/**
 * Shrink guide font until Arabic text fits the canvas (width is the usual limit for long words).
 * Then nudge up so guide strokes/dots render slightly wider than user ink.
 * `measure` must use the same font family / RTL settings as the visible canvas.
 */
export function fitGuideFontSizePx(
  cssW: number,
  cssH: number,
  arabicText: string,
  measure: (fontSize: number) => GuideFontMetrics,
  inkLineWidthPx: number = CANVAS_INK_LINE_WIDTH_PX,
): number {
  if (cssW < 8 || cssH < 8) return 12;

  const maxWidth = cssW * 0.94;
  const maxHeight = cssH * 0.6;
  let fontSize = Math.min(cssW, cssH) * guideFontSizeRatio(arabicText);

  for (let attempt = 0; attempt < 32; attempt++) {
    const { width, height } = measure(fontSize);
    if (width <= maxWidth && height <= maxHeight) {
      break;
    }

    const scale = Math.min(
      maxWidth / Math.max(width, 1),
      maxHeight / Math.max(height, 1),
      0.92,
    );
    fontSize = Math.max(12, fontSize * scale);
  }

  const baseFit = fontSize;
  /** Minimum font so typical glyph dots/outlines exceed ink width by a thin rim. */
  const inkMinFontSize = (inkLineWidthPx * 1.06) / GUIDE_DOT_TO_FONT;

  const trySizes = [
    baseFit * GUIDE_OVER_INK_SCALE,
    baseFit * 1.1,
    Math.max(baseFit, inkMinFontSize),
    baseFit * 1.06,
    baseFit,
  ].sort((a, b) => b - a);

  for (const candidate of trySizes) {
    const { width, height } = measure(candidate);
    if (width <= maxWidth && height <= maxHeight) {
      return candidate;
    }
  }

  return baseFit;
}

export function formatBestResult(
  value: string | undefined,
): "Excellent" | "Good" | null {
  if (value === "excellent") return "Excellent";
  if (value === "good") return "Good";
  return null;
}

/** Display size for Arabic reference text outside the canvas (sidebar, section lists). */
export function referenceArabicFontSize(arabicText: string): number {
  const len = countArabicLetters(arabicText);
  if (len <= 2) return 40;
  if (len <= 4) return 34;
  if (len <= 7) return 28;
  if (len <= 10) return 24;
  return 20;
}
