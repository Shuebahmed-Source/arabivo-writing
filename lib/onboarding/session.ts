import type { OnboardingSessionPayload } from "./types";

const STORAGE_KEY = "arabivo_onboarding_v1";

export function readOnboardingSession(): OnboardingSessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingSessionPayload;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      answers: parsed.answers ?? {},
      firstTraceCompleted: Boolean(parsed.firstTraceCompleted),
    };
  } catch {
    return null;
  }
}

export function writeOnboardingSession(payload: OnboardingSessionPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearOnboardingSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function mergeOnboardingSession(
  partial: Partial<OnboardingSessionPayload>,
): OnboardingSessionPayload {
  const current = readOnboardingSession() ?? {
    answers: {},
    firstTraceCompleted: false,
  };
  const next: OnboardingSessionPayload = {
    answers: { ...current.answers, ...partial.answers },
    firstTraceCompleted:
      partial.firstTraceCompleted ?? current.firstTraceCompleted,
  };
  writeOnboardingSession(next);
  return next;
}
