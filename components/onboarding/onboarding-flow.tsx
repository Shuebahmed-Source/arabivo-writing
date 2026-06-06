"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/steps";
import {
  mergeOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/session";
import {
  nextStep,
  onboardingProgressPercent,
  onboardingStepHref,
  parseOnboardingStep,
  prevStep,
  questionIndexFromStep,
  showsOnboardingTopBar,
} from "@/lib/onboarding/routing";
import type { OnboardingAnswers, OnboardingStepId } from "@/lib/onboarding/types";

import { OnboardingProjectionStep } from "./projection-step";
import { OnboardingQuestionStepView } from "./question-step";
import { OnboardingSignupStep } from "./signup-step";
import { OnboardingTraceStep } from "./trace-step";
import { OnboardingTopBar } from "./top-bar";

type Props = {
  initialStep: OnboardingStepId;
};

export function OnboardingFlow({ initialStep }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStepId>(initialStep);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [firstTraceCompleted, setFirstTraceCompleted] = useState(false);

  useEffect(() => {
    const session = readOnboardingSession();
    if (session) {
      setAnswers(session.answers);
      setFirstTraceCompleted(session.firstTraceCompleted);
    }
  }, []);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    const onPopState = () => {
      const raw = new URLSearchParams(window.location.search).get("step");
      setStep(parseOnboardingStep(raw));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const persist = useCallback(
    (nextAnswers: OnboardingAnswers, traceDone: boolean) => {
      mergeOnboardingSession({
        answers: nextAnswers,
        firstTraceCompleted: traceDone,
      });
    },
    [],
  );

  const goTo = useCallback(
    (target: OnboardingStepId) => {
      if (target === "welcome") {
        router.push("/onboarding");
        return;
      }
      setStep(target);
      router.push(onboardingStepHref(target));
    },
    [router],
  );

  const handleNext = useCallback(() => {
    goTo(nextStep(step));
  }, [goTo, step]);

  const handleBack = useCallback(() => {
    goTo(prevStep(step));
  }, [goTo, step]);

  const qi = questionIndexFromStep(step);
  const question = ONBOARDING_QUESTIONS[qi];
  const progress = useMemo(
    () => onboardingProgressPercent(step),
    [step],
  );

  return (
    <div className="onb-frame">
      {showsOnboardingTopBar(step) ? (
        <OnboardingTopBar progress={progress} onBack={handleBack} />
      ) : null}

      {step.startsWith("q") && question ? (
        <OnboardingQuestionStepView
          step={question}
          value={answers[question.id]}
          onPick={(index) => {
            const nextAnswers = { ...answers, [question.id]: index };
            setAnswers(nextAnswers);
            persist(nextAnswers, firstTraceCompleted);
          }}
          onContinue={handleNext}
        />
      ) : null}

      {step === "trace" ? (
        <OnboardingTraceStep
          onDone={() => {
            setFirstTraceCompleted(true);
            persist(answers, true);
            handleNext();
          }}
        />
      ) : null}

      {step === "projection" ? (
        <OnboardingProjectionStep answers={answers} onContinue={handleNext} />
      ) : null}

      {step === "signup" ? (
        <OnboardingSignupStep
          answers={answers}
          firstTraceCompleted={firstTraceCompleted}
        />
      ) : null}
    </div>
  );
}
