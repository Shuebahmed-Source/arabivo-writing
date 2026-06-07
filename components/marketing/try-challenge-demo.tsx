"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { captureEvent } from "@/components/analytics/posthog-provider";
import { TrialFunnelCTAs } from "@/components/marketing/trial-funnel-ctas";
import { Button } from "@/components/ui/button";
import {
  type TraceScoreResult,
  type WritingCanvasHandle,
  WritingCanvas,
} from "@/components/writing/writing-canvas";
import { WritingFeedbackPanel } from "@/components/writing/writing-feedback-panel";
import type { HomepageDemoChallenge } from "@/lib/marketing/demo-challenge";
import { cn } from "@/lib/utils";

type Props = {
  demo: HomepageDemoChallenge;
  initialSignedIn: boolean;
  className?: string;
  /** When true, show a compact heading (for `/try`). */
  compactHeading?: boolean;
};

export function TryChallengeDemo({
  demo,
  initialSignedIn,
  className,
  compactHeading = false,
}: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const signedIn = isLoaded ? Boolean(isSignedIn) : initialSignedIn;

  const canvasRef = useRef<WritingCanvasHandle>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<TraceScoreResult | null>(null);
  const [feedbackTick, setFeedbackTick] = useState(0);
  const [passed, setPassed] = useState(false);

  const handleClear = () => {
    canvasRef.current?.clear();
    setFeedback(null);
    setPassed(false);
  };

  const handleCheck = () => {
    const result = canvasRef.current?.check();
    if (!result) return;

    setFeedback(null);
    setFeedbackTick((t) => t + 1);
    captureEvent("demo_trace_checked", {
      lesson_id: demo.lessonId,
      result: result.level,
    });

    if (result.level === "try-again") {
      setPassed(false);
      setFeedback(result);
      return;
    }

    setPassed(true);
    setFeedback(result);
    captureEvent("demo_trace_passed", {
      lesson_id: demo.lessonId,
      result: result.level,
    });
  };

  return (
    <div className={cn("flex flex-col gap-5 sm:gap-6", className)}>
      <div className="space-y-2">
        {!compactHeading ? (
          <p className="text-sm font-medium text-primary">Try it now — no account</p>
        ) : null}
        <h2
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground",
            compactHeading
              ? "text-2xl sm:text-3xl"
              : "text-xl sm:text-2xl",
          )}
        >
          Can you write this?
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {demo.hookLine} Trace it on the canvas below — finger, stylus, or mouse.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/15 bg-card/50 p-4 shadow-sm ring-1 ring-primary/10 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Challenge · trace
            </p>
            <p
              className="font-arabic text-4xl leading-none text-foreground sm:text-5xl"
              dir="rtl"
              lang="ar"
            >
              {demo.arabicText}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{demo.transliteration}</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background">
          <WritingCanvas
            ref={canvasRef}
            guideText={demo.arabicText}
            showGuide={showGuide}
            className="min-h-[260px] sm:min-h-[320px] md:min-h-[360px]"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3 sm:bottom-4">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/80 bg-background/95 p-1 shadow-lg shadow-primary/5 backdrop-blur-sm sm:gap-1.5 sm:p-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 touch-manipulation sm:size-9"
                onClick={() => setShowGuide((v) => !v)}
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
              >
                Clear
              </Button>

              <Button
                type="button"
                size="sm"
                className="min-h-10 touch-manipulation px-4 sm:min-h-9"
                onClick={handleCheck}
              >
                Check
              </Button>
            </div>
          </div>
        </div>

        {feedback ? (
          <div className="mt-4 space-y-4">
            <WritingFeedbackPanel key={feedbackTick} level={feedback.level} />

            {passed ? (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-4 sm:p-5">
                <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  Yes — that&apos;s real Arabic script.
                </p>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {demo.revealLine}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {demo.englishMeaning}
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {signedIn ? (
                    <Button
                      size="lg"
                      nativeButton={false}
                      render={
                        <Link
                          href="/lessons/sections/challenge-words-core"
                          onClick={() =>
                            captureEvent("demo_cta_click", {
                              target: "challenge_section",
                            })
                          }
                        />
                      }
                      className="min-h-12 w-full sm:w-auto"
                    >
                      See all challenge words
                    </Button>
                  ) : (
                    <TrialFunnelCTAs
                      initialSignedIn={initialSignedIn}
                      variant="hero"
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Trace the faint guide, then tap{" "}
            <span className="font-medium text-foreground">Check</span>. No sign-up
            required for this demo.
          </p>
        )}
      </div>
    </div>
  );
}
