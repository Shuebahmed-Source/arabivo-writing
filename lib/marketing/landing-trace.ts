/** Font size for the landing-page challenge canvas (handoff reference). */
export function landingChallengeFontSize(width: number, height: number): number {
  return Math.min(height * 0.7, width * 0.42);
}

export const LANDING_CHALLENGE_CELL = 13;
export const LANDING_CHALLENGE_BRUSH = 18;
export const LANDING_CHALLENGE_THRESHOLD = 0.48;
export const LANDING_CHALLENGE_PCT_SCALE = 178;
