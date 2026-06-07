export type DailyChallenge = {
  lessonId: string;
  arabicText: string;
  transliteration: string;
  englishMeaning: string;
  hookLine: string;
  revealLine: string;
  /** UTC calendar date (YYYY-MM-DD) this challenge is keyed to. */
  challengeDate: string;
};

export type DailyChallengeStreak = {
  currentStreak: number;
  completedToday: boolean;
};
