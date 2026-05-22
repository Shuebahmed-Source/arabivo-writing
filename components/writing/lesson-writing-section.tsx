"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { recordLessonCompletion } from "@/app/actions/progress";
import { captureEvent } from "@/components/analytics/posthog-provider";
import { Button } from "@/components/ui/button";

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
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<TraceScoreResult | null>(null);
  const [feedbackTick, setFeedbackTick] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [complete, setComplete] = useState<CompleteState | null>(null);

  useEffect(() => {
    captureEvent("lesson_started", { lesson_id: lessonId });
  }, [lessonId]);

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
      captureEvent("lesson_completed", {
        lesson_id: lessonId,
        result: saveLevel,
      });
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

  const controlsDisabled = pending || complete !== null;

  return (
    <>
      <section
        className="flex flex-col gap-3 sm:gap-4"
        aria-labelledby="writing-area-heading"
      >
        <h2 id="writing-area-heading" className="sr-only">
          Practice writing
        </h2>

        <div className="relative">
          <WritingCanvas
            ref={canvasRef}
            guideText={guideText}
            showGuide={showGuide}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3 sm:bottom-4">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg shadow-primary/5 backdrop-blur-sm sm:gap-1.5 sm:p-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 touch-manipulation sm:size-9"
                onClick={() => setShowGuide((v) => !v)}
                disabled={controlsDisabled}
                aria-label={showGuide ? "Hide tracing guide" : "Show tracing guide"}
                aria-pressed={showGuide}
              >
                {showGuide ? (
                  <Eye className="size-4" aria-hidden />
                ) : (
                  <EyeOff className="size-4" aria-hidden />
                )}
              </Button>

              <span
                className="mx-0.5 hidden h-6 w-px bg-border/80 sm:block"
                aria-hidden
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-10 touch-manipulation px-3 sm:min-h-9"
                onClick={handleClear}
                disabled={controlsDisabled}
              >
                Clear
              </Button>

              <Button
                type="button"
                size="sm"
                className="min-h-10 touch-manipulation px-4 sm:min-h-9"
                onClick={handleCheck}
                disabled={controlsDisabled}
              >
                {pending ? "Saving…" : "Check"}
              </Button>
            </div>
          </div>
        </div>

        {feedback ? (
          <WritingFeedbackPanel key={feedbackTick} level={feedback.level} />
        ) : null}

        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Trace the faint guide, then <span className="font-medium text-foreground">Check</span>.
          Feedback rates shape, not handwriting.
        </p>
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
