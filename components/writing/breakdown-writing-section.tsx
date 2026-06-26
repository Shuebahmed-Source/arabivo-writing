"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { recordLessonCompletion } from "@/app/actions/progress";
import { captureEvent } from "@/components/analytics/posthog-provider";
import { Button } from "@/components/ui/button";
import { toIsolatedDisplay } from "@/lib/writing/lesson-display";

import { LessonCompleteOverlay } from "./lesson-complete-overlay";
import { WritingFeedbackPanel } from "./writing-feedback-panel";
import {
  type TraceScoreResult,
  type WritingCanvasHandle,
  WritingCanvas,
} from "./writing-canvas";

type Props = {
  arabicText: string;
  lessonId: string;
  sectionTitle: string;
  sectionHref: string;
  sectionPosition: number;
  sectionTotal: number;
  lessonShortTitle: string;
};

type ScoreLevel = "excellent" | "good";

type CompleteState = {
  level: ScoreLevel;
  nextPath: string;
};

export function BreakdownWritingSection({
  arabicText,
  lessonId,
  sectionTitle,
  sectionHref,
  sectionPosition,
  sectionTotal,
  lessonShortTitle,
}: Props) {
  const router = useRouter();
  const isolatedRef = useRef<WritingCanvasHandle>(null);
  const connectedRef = useRef<WritingCanvasHandle>(null);

  const [showConnectedGuide, setShowConnectedGuide] = useState(true);
  const [connectedPassed, setConnectedPassed] = useState(false);

  const [connectedFeedback, setConnectedFeedback] = useState<TraceScoreResult | null>(null);
  const [connectedTick, setConnectedTick] = useState(0);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [complete, setComplete] = useState<CompleteState | null>(null);

  useEffect(() => {
    captureEvent("lesson_started", { lesson_id: lessonId });
  }, [lessonId]);

  const isolatedText = toIsolatedDisplay(arabicText);
  const controlsDisabled = pending || complete !== null;

  const handleCheckConnected = () => {
    const result = connectedRef.current?.check();
    if (!result) return;
    setConnectedFeedback(null);
    setConnectedTick((t) => t + 1);
    setSaveError(null);
    if (result.level === "try-again") {
      setConnectedFeedback(result);
      return;
    }
    const level = result.level as ScoreLevel;
    setConnectedPassed(true);
    startTransition(async () => {
      const out = await recordLessonCompletion(lessonId, level);
      if (!out.ok) {
        setSaveError(out.message);
        return;
      }
      captureEvent("lesson_completed", { lesson_id: lessonId, result: level });
      setComplete({ level, nextPath: out.nextPath });
    });
  };

  const handleClearConnected = () => {
    connectedRef.current?.clear();
    setConnectedFeedback(null);
    setConnectedPassed(false);
    setSaveError(null);
  };

  const handlePracticeAgain = () => {
    setComplete(null);
    isolatedRef.current?.clear();
    connectedRef.current?.clear();
    setConnectedFeedback(null);
    setConnectedPassed(false);
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
        className="flex flex-col gap-3"
        aria-labelledby="breakdown-heading"
      >
        <h2 id="breakdown-heading" className="sr-only">
          Breakdown practice
        </h2>

        {/* ── Canvas 1: isolated letters (no controls — trace freely) ── */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Isolated letters
          </span>
          <WritingCanvas
            ref={isolatedRef}
            guideText={isolatedText}
            showGuide
            className="min-h-[180px] sm:min-h-[210px] md:min-h-[230px] lg:min-h-[240px]"
          />
        </div>

        {/* ── Arrow divider ───────────────────────────────────── */}
        <div className="flex items-center justify-center py-0.5">
          <ArrowDown className="size-5 text-primary" aria-hidden />
        </div>

        {/* ── Canvas 2: connected word ───────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Connected word
            </span>
            {connectedPassed && (
              <span className="text-xs font-medium text-primary">✓ Done</span>
            )}
          </div>

          <WritingCanvas
            ref={connectedRef}
            guideText={arabicText}
            showGuide={showConnectedGuide}
            className="min-h-[180px] sm:min-h-[210px] md:min-h-[230px] lg:min-h-[240px]"
          />

          <div className="flex justify-center">
            <div className="flex items-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg shadow-primary/5 sm:gap-1.5 sm:p-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 touch-manipulation"
                onClick={() => setShowConnectedGuide((v) => !v)}
                disabled={controlsDisabled}
                aria-label={showConnectedGuide ? "Hide guide" : "Show guide"}
                aria-pressed={showConnectedGuide}
              >
                {showConnectedGuide ? (
                  <Eye className="size-4" aria-hidden />
                ) : (
                  <EyeOff className="size-4" aria-hidden />
                )}
              </Button>
              <span className="mx-0.5 hidden h-6 w-px bg-border/80 sm:block" aria-hidden />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-9 touch-manipulation px-3"
                onClick={handleClearConnected}
                disabled={controlsDisabled}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                className="min-h-9 touch-manipulation px-4"
                onClick={handleCheckConnected}
                disabled={controlsDisabled || connectedPassed}
              >
                {connectedPassed ? "Passed" : "Check"}
              </Button>
            </div>
          </div>

          {connectedFeedback ? (
            <WritingFeedbackPanel key={connectedTick} level={connectedFeedback.level} />
          ) : null}
        </div>

        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Trace the isolated letters above, then trace and{" "}
          <span className="font-medium text-foreground">Check</span> the connected word below.
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
          arabicText={arabicText}
          level={complete.level}
          onPracticeAgain={handlePracticeAgain}
          onNext={handleCompleteNext}
        />
      ) : null}
    </>
  );
}
