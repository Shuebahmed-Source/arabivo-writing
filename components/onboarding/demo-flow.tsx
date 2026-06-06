"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  markDemoCompleted,
  saveOnboardingProfile,
} from "@/app/actions/onboarding";
import { ONBOARDING_DEMO_EXERCISES } from "@/lib/onboarding/demo-exercises";
import {
  clearOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/session";

import { OnboardingTraceStep } from "./trace-step";
import { OnboardingTopBar } from "./top-bar";

export function OnboardingDemoFlow() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exercise = ONBOARDING_DEMO_EXERCISES[index];
  const total = ONBOARDING_DEMO_EXERCISES.length;
  const progress = ((index + 1) / total) * 100;

  useEffect(() => {
    const sync = async () => {
      const session = readOnboardingSession();
      if (session) {
        await saveOnboardingProfile(
          session.answers,
          session.firstTraceCompleted,
        );
        clearOnboardingSession();
      }
      setReady(true);
    };
    void sync();
  }, []);

  const finishDemo = useCallback(async () => {
    if (finishing) return;
    setError(null);
    setFinishing(true);
    const res = await markDemoCompleted();
    if (!res.ok) {
      setFinishing(false);
      setError(res.message);
      return;
    }
    router.push("/subscribe");
    router.refresh();
  }, [finishing, router]);

  const onExerciseDone = useCallback(() => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    void finishDemo();
  }, [finishDemo, index, total]);

  if (!ready) {
    return null;
  }

  return (
    <div className="onb-frame">
      <OnboardingTopBar
        progress={progress}
        onBack={() => {
          if (index > 0) setIndex((i) => i - 1);
          else router.push("/onboarding?step=signup");
        }}
      />
      <OnboardingTraceStep
        key={exercise.id}
        glyph={exercise.glyph}
        translit={exercise.translit}
        meaning={exercise.meaning}
        tag={`${exercise.tag} · ${index + 1}/${total}`}
        title="Try a quick trace ✍️"
        sub="Three short exercises before your full plan unlocks."
        allowAdvanceWithoutTrace
        busy={finishing}
        continueLabel={
          index === total - 1 ? "Continue to your plan" : undefined
        }
        onDone={onExerciseDone}
      />
      {error ? (
        <p className="onb-error onb-demo-finishing" role="alert">
          {error}
        </p>
      ) : null}
      {finishing ? (
        <p className="onb-demo-finishing" role="status">
          Preparing your subscription…
        </p>
      ) : null}
    </div>
  );
}
