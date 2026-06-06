import type { OnboardingQuestionId } from "./types";

export type OnboardingQuestionStep = {
  id: OnboardingQuestionId;
  title: string;
  sub: string;
  options: { emoji: string; label: string }[];
};

export const ONBOARDING_QUESTIONS: OnboardingQuestionStep[] = [
  {
    id: "level",
    title: "How much Arabic can you read right now?",
    sub: "Be honest — there's a perfect starting point for everyone.",
    options: [
      { emoji: "🌱", label: "I can't read it yet" },
      { emoji: "🔤", label: "I know some letters" },
      { emoji: "📖", label: "I can read slowly" },
      { emoji: "🦉", label: "I read pretty fluently" },
    ],
  },
  {
    id: "why",
    title: "Why do you want to write Arabic?",
    sub: "This shapes the words you'll trace first.",
    options: [
      { emoji: "🕌", label: "Read & write the Quran" },
      { emoji: "🫶", label: "Reconnect with my heritage" },
      { emoji: "✈️", label: "Travel & everyday life" },
      { emoji: "🎓", label: "Study or work" },
    ],
  },
  {
    id: "experience",
    title: "Have you ever written Arabic by hand?",
    sub: "No wrong answers — we meet you where you are.",
    options: [
      { emoji: "🆕", label: "Never, totally new" },
      { emoji: "🏫", label: "A little, back in school" },
      { emoji: "✍️", label: "I practise now and then" },
      { emoji: "🔁", label: "I write fairly regularly" },
    ],
  },
  {
    id: "time",
    title: "How much time can you give it each day?",
    sub: "Small, steady reps beat long cramming.",
    options: [
      { emoji: "⏱️", label: "5 min" },
      { emoji: "⌛", label: "10 min" },
      { emoji: "⏰", label: "20 min" },
      { emoji: "🔥", label: "30 min+" },
    ],
  },
  {
    id: "goal",
    title: "Where do you want to be in a year?",
    sub: "Your daily plan adapts to this goal.",
    options: [
      { emoji: "📝", label: "Write my name & the basics" },
      { emoji: "💬", label: "Write words & short phrases" },
      { emoji: "📄", label: "Write full sentences smoothly" },
      { emoji: "🎨", label: "Beautiful, flowing handwriting" },
    ],
  },
];

export const LEVEL_FROM = [
  "absolute beginner",
  "early beginner",
  "intermediate reader",
  "advanced reader",
] as const;

export const GOAL_TO = [
  "confident basics",
  "words & short phrases",
  "full smooth sentences",
  "beautiful handwriting",
] as const;

export const TIME_LABEL = ["5 min", "10 min", "20 min", "30 min"] as const;

export const ONBOARDING_FLOW_KEYS = [
  "q0",
  "q1",
  "q2",
  "q3",
  "q4",
  "trace",
  "projection",
] as const;

export const FIRST_TRACE_GLYPH = "س";
export const FIRST_TRACE_TRANSLIT = "sīn";
export const FIRST_TRACE_MEANING = "the letter sīn";
