"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
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

  const [showIsolatedGuide, setShowIsolatedGuide] = useState(true);
  const [showConnectedGuide, setShowConnectedGuide] = useState(true);

  const [isolatedFeedback, setIsolatedFeedback] = useState<TraceScoreResult | null>(null);
  const [connectedFeedback, setConnectedFeedback] = useState<TraceScoreResult | null>(null);
  const [isolatedTick, setIsolatedTick] = useState(0);
  const [connectedTick, setConnectedTick] = useState(0);

  // null = not yet checked and passed; level = passed at this level
  const [isolatedScore, setIsolatedScore] = useState<ScoreLevel | null>(null);
  const [connectedScore, setConnectedScore] = useState<ScoreLevel | null>(null);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [complete, setComplete] = useState<CompleteState | null>(null);

  useEffect(() => {
    captureEvent("lesson_started", { lesson_id: lessonId });
  }, [lessonId]);

  const isolatedText = toIsolatedDisplay(arabicText);
  const bothDone = isolatedScore !== null && connectedScore !== null;
  const controlsDisabled = pending || complete !== null;

  // When both canvases pass, save and show completion overlay
  useEffect(() => {
    if (!bothDone || complete || pending) return;
    const level: ScoreLevel =
      isolatedScore === "excellent" && connectedScore === "excellent"
        ? "excellent"
        : "good";
    startTransition(async () => {
      const out = await recordLessonCompletion(lessonId, level);
      if (!out.ok) {
        setSaveError(out.message);
        return;
      }
      captureEvent("lesson_completed", { lesson_id: lessonId, result: level });
      setComplete({ level, nextPath: out.nextPath });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothDone]);

  const handleCheckIsolated = () => {
    const result = isolatedRef.current?.check();
    if (!result) return;
    setIsolatedFeedback(null);
    setIsolatedTick((t) => t + 1);
    setSaveError(null);
    if (result.level === "try-again") {
      setIsolatedFeedback(result);
      return;
    }
    setIsolatedScore(result.level);
  };

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
    setConnectedScore(result.level);
  };

  const handleClearIsolated = () => {
    isolatedRef.current?.clear();
    setIsolatedFeedback(null);
    setIsolatedScore(null);
    setSaveError(null);
  };

  const handleClearConnected = () => {
    connectedRef.current?.clear();
    setConnectedFeedback(null);
    setConnectedScore(null);
    setSaveError(null);
  };

  const handlePracticeAgain = () => {
    setComplete(null);
    isolatedRef.current?.clear();
    connectedRef.current?.clear();
    setIsolatedFeedback(null);
    setConnectedFeedback(null);
    setIsolatedScore(null);
    setConnectedScore(null);
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
      <div className="flex flex-col gap-6">
        {/* ── Canvas 1: isolated letters ─────────────────────────────── */}
        <section className="flex flex-col gap-3" aria-labelledby="isolated-heading">
          <div className="flex items-center justify-between">
            <h2
              id="isolated-heading"
              className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Isolated letters
            </h2>
            {isolatedScore !== null && (
              <span className="text-xs font-medium text-primary">✓ Done</span>
            )}
          </div>

          <div className="relative">
            <WritingCanvas
              ref={isolatedRef}
              guideText={isolatedText}
              showGuide={showIsolatedGuide}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3 sm:bottom-4">
              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg shadow-primary/5 backdrop-blur-sm sm:gap-1.5 sm:p-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 touch-manipulation sm:size-9"
                  onClick={() => setShowIsolatedGuide((v) => !v)}
                  disabled={controlsDisabled}
                  aria-label={showIsolatedGuide ? "Hide guide" : "Show guide"}
                  aria-pressed={showIsolatedGuide}
                >
                  {showIsolatedGuide ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                </Button>
                <span className="mx-0.5 hidden h-6 w-px bg-border/80 sm:block" aria-hidden />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-10 touch-manipulation px-3 sm:min-h-9"
                  onClick={handleClearIsolated}
                  disabled={controlsDisabled}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-10 touch-manipulation px-4 sm:min-h-9"
                  onClick={handleCheckIsolated}
                  disabled={controlsDisabled || isolatedScore !== null}
                >
                  {isolatedScore !== null ? "Passed" : "Check"}
                </Button>
              </div>
            </div>
          </div>

          {isolatedFeedback ? (
            <WritingFeedbackPanel key={isolatedTick} level={isolatedFeedback.level} />
          ) : null}
        </section>

        {/* ── Canvas 2: connected word ────────────────────────────────── */}
        <section className="flex flex-col gap-3" aria-labelledby="connected-heading">
          <div className="flex items-center justify-between">
            <h2
              id="connected-heading"
              className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Connected word
            </h2>
            {connectedScore !== null && (
              <span className="text-xs font-medium text-primary">✓ Done</span>
            )}
          </div>

          <div className="relative">
            <WritingCanvas
              ref={connectedRef}
              guideText={arabicText}
              showGuide={showConnectedGuide}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3 sm:bottom-4">
              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg shadow-primary/5 backdrop-blur-sm sm:gap-1.5 sm:p-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 touch-manipulation sm:size-9"
                  onClick={() => setShowConnectedGuide((v) => !v)}
                  disabled={controlsDisabled}
                  aria-label={showConnectedGuide ? "Hide guide" : "Show guide"}
                  aria-pressed={showConnectedGuide}
                >
                  {showConnectedGuide ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                </Button>
                <span className="mx-0.5 hidden h-6 w-px bg-border/80 sm:block" aria-hidden />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-10 touch-manipulation px-3 sm:min-h-9"
                  onClick={handleClearConnected}
                  disabled={controlsDisabled}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-10 touch-manipulation px-4 sm:min-h-9"
                  onClick={handleCheckConnected}
                  disabled={controlsDisabled || connectedScore !== null}
                >
                  {connectedScore !== null ? "Passed" : "Check"}
                </Button>
              </div>
            </div>
          </div>

          {connectedFeedback ? (
            <WritingFeedbackPanel key={connectedTick} level={connectedFeedback.level} />
          ) : null}
        </section>

        {saveError ? (
          <p className="text-sm text-destructive" role="alert">{saveError}</p>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Trace both canvases and hit <span className="font-medium text-foreground">Check</span> on each.
          Complete both to finish the lesson.
        </p>
      </div>

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
