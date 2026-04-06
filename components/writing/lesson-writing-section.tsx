"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { recordLessonCompletion } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { LessonCompleteOverlay } from "./lesson-complete-overlay";
import { WritingFeedbackPanel } from "./writing-feedback-panel";
import {
  type TraceScoreResult,
  type WritingCanvasHandle,
  WritingCanvas,
} from "./writing-canvas";

type LessonWritingSectionProps = {
  guideText: string;
  lessonId: string;
  sectionTitle: string;
  sectionHref: string;
  sectionPosition: number;
  sectionTotal: number;
  lessonShortTitle: string;
};

type CompleteState = {
  level: "excellent" | "good";
  nextPath: string;
};

export function LessonWritingSection({
  guideText,
  lessonId,
  sectionTitle,
  sectionHref,
  sectionPosition,
  sectionTotal,
  lessonShortTitle,
}: LessonWritingSectionProps) {
  const router = useRouter();
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const [feedback, setFeedback] = useState<TraceScoreResult | null>(null);
  const [feedbackTick, setFeedbackTick] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [complete, setComplete] = useState<CompleteState | null>(null);

  const handleClear = () => {
    canvasRef.current?.clear();
    setFeedback(null);
    setSaveError(null);
  };

  const handleCheck = () => {
    const result = canvasRef.current?.check();
    if (!result) return;

    setFeedback(null);
    setFeedbackTick((t) => t + 1);
    setSaveError(null);

    if (result.level === "try-again") {
      setFeedback(result);
      return;
    }

    const saveLevel = result.level;

    startTransition(async () => {
      const out = await recordLessonCompletion(lessonId, saveLevel);
      if (!out.ok) {
        setSaveError(out.message);
        setFeedback(result);
        return;
      }
      setComplete({ level: saveLevel, nextPath: out.nextPath });
    });
  };

  const handlePracticeAgain = () => {
    setComplete(null);
    canvasRef.current?.clear();
    setFeedback(null);
    setSaveError(null);
  };

  const handleCompleteNext = () => {
    if (!complete) return;
    const path = complete.nextPath;
    setComplete(null);
    router.push(path);
    router.refresh();
  };

  return (
    <>
      <section
        className="rounded-2xl border border-border/70 bg-card/40 p-5 shadow-sm ring-1 ring-primary/5 sm:p-6 md:p-7"
        aria-labelledby="writing-area-heading"
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <header className="flex flex-col gap-1.5 sm:max-w-xl">
            <h2
              id="writing-area-heading"
              className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
            >
              Practice writing
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              Trace the faint letter, then tap{" "}
              <span className="font-medium text-foreground">Check</span> for
              feedback.{" "}
              <span className="font-medium text-foreground">Good</span> or{" "}
              <span className="font-medium text-foreground">Excellent</span>{" "}
              saves progress and opens a short celebration—then you can go to the
              next item.{" "}
              <span className="font-medium text-foreground">Clear</span> removes
              your strokes and the on-screen result (not saved progress).
            </p>
          </header>

          <WritingCanvas guideText={guideText} ref={canvasRef} />

          {feedback ? (
            <WritingFeedbackPanel key={feedbackTick} level={feedback.level} />
          ) : null}

          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}

          <Separator className="bg-border/80" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-12 w-full touch-manipulation transition-[transform,colors] duration-150 active:scale-[0.98] sm:min-h-11 sm:w-auto"
                onClick={handleClear}
                disabled={pending || complete !== null}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="lg"
                className="min-h-12 w-full touch-manipulation transition-[transform,colors] duration-150 active:scale-[0.98] sm:min-h-11 sm:w-auto"
                onClick={handleCheck}
                disabled={pending || complete !== null}
              >
                {pending ? "Saving…" : "Check"}
              </Button>
            </div>
            <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-left">
              Feedback is a rough match to the guide shape, not a reading of your
              handwriting.
            </p>
          </div>
        </div>
      </section>

      {complete ? (
        <LessonCompleteOverlay
          open
          lessonId={lessonId}
          sectionTitle={sectionTitle}
          sectionHref={sectionHref}
          sectionPosition={sectionPosition}
          sectionTotal={sectionTotal}
          lessonShortTitle={lessonShortTitle}
          arabicText={guideText}
          level={complete.level}
          onPracticeAgain={handlePracticeAgain}
          onNext={handleCompleteNext}
        />
      ) : null}
    </>
  );
}
