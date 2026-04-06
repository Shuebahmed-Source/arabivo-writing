/**
 * Pixel-based trace scoring: compares a binary user-ink mask to a binary guide mask.
 * Both ImageData buffers must be the same width/height (typically the canvas backing store).
 *
 * Sampling skips pixels (SAMPLE_STEP) to keep Check responsive on mobile.
 */

export type TraceScoreLevel = "excellent" | "good" | "try-again";

export type TraceScoreResult = {
  level: TraceScoreLevel;
  /** Share of guide pixels (sampled) that the user covered */
  coverage: number;
  /** Share of user ink (sampled) that lies on the guide */
  precision: number;
  /** Share of user ink (sampled) drawn outside the guide */
  offGuideRatio: number;
  sampledGuidePixels: number;
  sampledUserPixels: number;
  sampledOverlapPixels: number;
};

/** Read every Nth pixel along x and y (device pixels). */
export const SAMPLE_STEP = 2;

/**
 * Guide vs user thresholds are split on purpose: the guide mask is white text on
 * black, so glyph edges are anti-aliased (~40–180). Users trace the visible faint
 * letter along those edges; treating only R≥140 as “guide” makes correct traces
 * look mostly off-guide. User strokes stay stricter (solid ink).
 */
export const GUIDE_PIXEL_ON_THRESHOLD = 88;
export const USER_PIXEL_ON_THRESHOLD = 120;

/** @deprecated use GUIDE_PIXEL_ON_THRESHOLD / USER_PIXEL_ON_THRESHOLD */
export const PIXEL_ON_THRESHOLD = GUIDE_PIXEL_ON_THRESHOLD;

/**
 * Minimum sampled user pixels required (roughly “did they draw something?”).
 * Scales with canvas, but must stay achievable for one stroke on wide canvases
 * (otherwise a correct thin alif on a full-width panel never passes).
 */
const MIN_USER_FRACTION_OF_GRID = 0.0025;
/** Cap so a single continuous trace can satisfy minUser on large viewports. */
const MIN_USER_SAMPLE_CAP = 200;

/** Minimum sampled guide pixels (avoid divide-by-zero on empty mask). */
const MIN_GUIDE_PIXELS = 24;

/**
 * Threshold rules (tuned for approximate tracing, not OCR):
 *
 * Excellent — strong overlap with the guide and little scribbling outside it.
 * Good — noticeable coverage or reasonable precision, with moderate outside ink.
 * try-again — weak coverage, mostly off-guide ink, or almost no drawing.
 */
const EXCELLENT_MIN_COVERAGE = 0.28;
const EXCELLENT_MIN_PRECISION = 0.4;
const EXCELLENT_MAX_OFF_GUIDE = 0.4;

const EXCELLENT_ALT_MIN_PRECISION = 0.54;
const EXCELLENT_ALT_MIN_OVERLAP = 40;
const EXCELLENT_ALT_MAX_OFF_GUIDE = 0.32;
const EXCELLENT_ALT_MIN_COVERAGE = 0.1;

const GOOD_MIN_COVERAGE = 0.12;
const GOOD_MIN_PRECISION = 0.26;
const GOOD_MAX_OFF_GUIDE = 0.58;

/** When the guide is very thin (e.g. alif), coverage stays low even if ink is on-letter. */
const GOOD_ALT_MIN_PRECISION = 0.42;
const GOOD_ALT_MIN_OVERLAP = 22;
const GOOD_ALT_MAX_OFF_GUIDE = 0.48;

/** If more than this fraction of ink is off-guide, cap at try-again. */
const HARD_FAIL_OFF_GUIDE = 0.72;

export function scoreUserTrace(
  guideMask: ImageData,
  userMask: ImageData,
): TraceScoreResult {
  const width = guideMask.width;
  const height = guideMask.height;

  let guideCount = 0;
  let userCount = 0;
  let overlapCount = 0;
  let userOffGuideCount = 0;

  const step = SAMPLE_STEP;
  const cellsX = Math.ceil(width / step);
  const cellsY = Math.ceil(height / step);
  const gridCells = cellsX * cellsY;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const g = guideMask.data[i] ?? 0;
      const u = userMask.data[i] ?? 0;
      const onGuide = g >= GUIDE_PIXEL_ON_THRESHOLD;
      const onUser = u >= USER_PIXEL_ON_THRESHOLD;

      if (onGuide) guideCount++;
      if (onUser) userCount++;
      if (onGuide && onUser) overlapCount++;
      if (onUser && !onGuide) userOffGuideCount++;
    }
  }

  const minUser = Math.max(
    16,
    Math.min(
      MIN_USER_SAMPLE_CAP,
      Math.floor(gridCells * MIN_USER_FRACTION_OF_GRID),
    ),
  );

  const coverage = guideCount > 0 ? overlapCount / guideCount : 0;
  const precision = userCount > 0 ? overlapCount / userCount : 0;
  const offGuideRatio = userCount > 0 ? userOffGuideCount / userCount : 0;

  const tryAgain = (): TraceScoreResult => ({
    level: "try-again",
    coverage,
    precision,
    offGuideRatio,
    sampledGuidePixels: guideCount,
    sampledUserPixels: userCount,
    sampledOverlapPixels: overlapCount,
  });

  if (guideCount < MIN_GUIDE_PIXELS) {
    return tryAgain();
  }

  if (userCount < minUser) {
    return tryAgain();
  }

  if (offGuideRatio >= HARD_FAIL_OFF_GUIDE) {
    return tryAgain();
  }

  const excellentStandard =
    coverage >= EXCELLENT_MIN_COVERAGE &&
    precision >= EXCELLENT_MIN_PRECISION &&
    offGuideRatio <= EXCELLENT_MAX_OFF_GUIDE;

  const excellentThinGlyph =
    precision >= EXCELLENT_ALT_MIN_PRECISION &&
    overlapCount >= EXCELLENT_ALT_MIN_OVERLAP &&
    offGuideRatio <= EXCELLENT_ALT_MAX_OFF_GUIDE &&
    coverage >= EXCELLENT_ALT_MIN_COVERAGE;

  if (excellentStandard || excellentThinGlyph) {
    return {
      level: "excellent",
      coverage,
      precision,
      offGuideRatio,
      sampledGuidePixels: guideCount,
      sampledUserPixels: userCount,
      sampledOverlapPixels: overlapCount,
    };
  }

  const goodByCoverage =
    coverage >= GOOD_MIN_COVERAGE &&
    precision >= GOOD_MIN_PRECISION &&
    offGuideRatio <= GOOD_MAX_OFF_GUIDE;

  const goodByThinGlyph =
    precision >= GOOD_ALT_MIN_PRECISION &&
    overlapCount >= GOOD_ALT_MIN_OVERLAP &&
    offGuideRatio <= GOOD_ALT_MAX_OFF_GUIDE;

  if (goodByCoverage || goodByThinGlyph) {
    return {
      level: "good",
      coverage,
      precision,
      offGuideRatio,
      sampledGuidePixels: guideCount,
      sampledUserPixels: userCount,
      sampledOverlapPixels: overlapCount,
    };
  }

  return tryAgain();
}

export function feedbackLabel(level: TraceScoreLevel): string {
  if (level === "excellent") return "Excellent";
  if (level === "good") return "Good";
  return "Try again";
}

/** Short coaching line shown under the headline (UX only; scoring unchanged). */
export function feedbackSublabel(level: TraceScoreLevel): string {
  if (level === "excellent") {
    return "Your trace lines up well with the guide. Keep this rhythm for the next shape.";
  }
  if (level === "good") {
    return "You are close. Slow down a little and hug the faint letter a bit more.";
  }
  return "Clear the canvas and trace again, staying closer to the guide strokes.";
}
