"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  getCompletionBadgeTintClass,
  getCompletionIconForLesson,
} from "@/lib/writing/lesson-complete-visual";
import { cn } from "@/lib/utils";

import type { TraceScoreLevel } from "./score-user-trace";

export type LessonCompleteOverlayProps = {
  open: boolean;
  lessonId: string;
  sectionTitle: string;
  sectionHref: string;
  /** 1-based index of this lesson within the section */
  sectionPosition: number;
  sectionTotal: number;
  /** e.g. “Khāʾ” without the “— isolated” suffix */
  lessonShortTitle: string;
  arabicText: string;
  level: Extract<TraceScoreLevel, "excellent" | "good">;
  onPracticeAgain: () => void;
  onNext: () => void;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -14 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 420, damping: 24 },
  },
};

const riseVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
};

function resultPhrase(level: "excellent" | "good"): string {
  return level === "excellent" ? "Excellent!" : "Good effort!";
}

export function LessonCompleteOverlay({
  open,
  lessonId,
  sectionTitle,
  sectionHref,
  sectionPosition,
  sectionTotal,
  lessonShortTitle,
  arabicText,
  level,
  onPracticeAgain,
  onNext,
}: LessonCompleteOverlayProps) {
  const Icon = getCompletionIconForLesson(lessonId);
  const badgeTint = getCompletionBadgeTintClass(lessonId);
  const progressRatio = sectionTotal > 0 ? sectionPosition / sectionTotal : 1;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="lesson-complete"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-complete-heading"
          aria-describedby="lesson-complete-result"
          className="fixed inset-0 z-50 flex flex-col bg-background/92 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              nativeButton={false}
              render={<Link href={sectionHref} aria-label="Back to section" />}
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Button>
            <h2 className="flex-1 text-center text-sm font-medium text-foreground sm:text-base">
              {sectionTitle}
            </h2>
            <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground sm:w-12 sm:text-sm">
              {sectionPosition}/{sectionTotal}
            </span>
          </header>

          <div className="px-4 pb-2 pt-3 sm:px-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progressRatio * 100)}%` }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.12,
                }}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-8 pt-4 sm:px-6">
            <motion.div
              className="flex w-full max-w-md flex-col items-center gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={iconVariants}
                className={cn(
                  "flex size-20 items-center justify-center rounded-full sm:size-24",
                  badgeTint,
                )}
                aria-hidden
              >
                <Icon className="size-9 sm:size-10" strokeWidth={1.75} />
              </motion.div>

              <motion.div
                variants={riseVariants}
                className="flex flex-col items-center gap-2 text-center"
              >
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Lesson complete
                </p>
                <h3
                  id="lesson-complete-heading"
                  className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                >
                  {lessonShortTitle}
                </h3>
              </motion.div>

              <motion.div
                variants={riseVariants}
                className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm ring-1 ring-primary/5"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Result
                </p>
                <p
                  id="lesson-complete-result"
                  className={cn(
                    "mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl",
                    level === "excellent" && "text-primary",
                    level === "good" && "text-primary/85",
                  )}
                >
                  {resultPhrase(level)}
                </p>
                <p
                  className="pointer-events-none absolute bottom-2 end-4 font-arabic text-7xl leading-none text-muted-foreground/15 sm:text-8xl"
                  dir="rtl"
                  lang="ar"
                  aria-hidden
                >
                  {arabicText}
                </p>
              </motion.div>

              <motion.div
                variants={riseVariants}
                className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-12 w-full touch-manipulation sm:min-h-11 sm:max-w-[200px]"
                  onClick={onPracticeAgain}
                >
                  <RotateCcw className="me-2 size-4" aria-hidden />
                  Practice again
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full touch-manipulation sm:min-h-11 sm:flex-1"
                  onClick={onNext}
                >
                  Next
                  <ChevronRight className="ms-1 size-4" aria-hidden />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
