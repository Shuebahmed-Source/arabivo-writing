import { ONBOARDING_FLOW_KEYS } from "./steps";
import type { OnboardingStepId } from "./types";

const QUESTION_STEP_IDS: OnboardingStepId[] = [
  "q0",
  "q1",
  "q2",
  "q3",
  "q4",
];

export function parseOnboardingStep(
  raw: string | null | undefined,
): OnboardingStepId {
  if (
    raw === "welcome" ||
    raw === "trace" ||
    raw === "projection" ||
    raw === "signup"
  ) {
    return raw;
  }
  if (raw && QUESTION_STEP_IDS.includes(raw as OnboardingStepId)) {
    return raw as OnboardingStepId;
  }
  return "welcome";
}

export function questionIndexFromStep(step: OnboardingStepId): number {
  if (step.startsWith("q")) {
    const n = Number(step.slice(1));
    if (Number.isFinite(n) && n >= 0 && n <= 4) return n;
  }
  return 0;
}

export function stepFromQuestionIndex(index: number): OnboardingStepId {
  return `q${index}` as OnboardingStepId;
}

export function nextStep(step: OnboardingStepId): OnboardingStepId {
  if (step === "welcome") return "q0";
  if (step.startsWith("q")) {
    const qi = questionIndexFromStep(step);
    if (qi < 4) return stepFromQuestionIndex(qi + 1);
    return "trace";
  }
  if (step === "trace") return "projection";
  if (step === "projection") return "signup";
  return "signup";
}

export function prevStep(step: OnboardingStepId): OnboardingStepId {
  if (step === "q0") return "welcome";
  if (step.startsWith("q")) {
    const qi = questionIndexFromStep(step);
    if (qi > 0) return stepFromQuestionIndex(qi - 1);
    return "welcome";
  }
  if (step === "trace") return "q4";
  if (step === "projection") return "trace";
  if (step === "signup") return "projection";
  return "welcome";
}

export function onboardingProgressPercent(step: OnboardingStepId): number {
  const key =
    step.startsWith("q") || step === "trace" || step === "projection"
      ? step
      : step === "signup"
        ? "projection"
        : null;
  if (!key) return 0;
  const idx = ONBOARDING_FLOW_KEYS.indexOf(
    key as (typeof ONBOARDING_FLOW_KEYS)[number],
  );
  if (idx < 0) return 0;
  return ((idx + 1) / ONBOARDING_FLOW_KEYS.length) * 100;
}

export function showsOnboardingTopBar(step: OnboardingStepId): boolean {
  return (
    step.startsWith("q") ||
    step === "trace" ||
    step === "projection" ||
    step === "signup"
  );
}

export function onboardingStepHref(step: OnboardingStepId): string {
  return step === "welcome" ? "/onboarding" : `/onboarding?step=${step}`;
}
