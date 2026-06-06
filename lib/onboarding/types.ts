export type OnboardingQuestionId =
  | "level"
  | "why"
  | "experience"
  | "time"
  | "goal";

export type OnboardingAnswers = Partial<
  Record<OnboardingQuestionId, number>
>;

export type OnboardingStepId =
  | "welcome"
  | "q0"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "trace"
  | "projection"
  | "signup";

export type OnboardingSessionPayload = {
  answers: OnboardingAnswers;
  firstTraceCompleted: boolean;
};

export type DemoExercise = {
  id: string;
  glyph: string;
  translit: string;
  meaning: string;
  tag: string;
};
