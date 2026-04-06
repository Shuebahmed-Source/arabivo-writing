import { CircleCheck, Sparkles, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  type TraceScoreLevel,
  feedbackLabel,
  feedbackSublabel,
} from "./score-user-trace";

type Props = {
  level: TraceScoreLevel;
  className?: string;
};

const iconWrap = "flex size-11 shrink-0 items-center justify-center rounded-full sm:size-12";

export function WritingFeedbackPanel({ level, className }: Props) {
  const label = feedbackLabel(level);
  const sublabel = feedbackSublabel(level);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "rounded-xl border p-4 shadow-sm sm:p-5",
        level === "excellent" &&
          "border-primary/35 bg-primary/[0.08] ring-1 ring-primary/10",
        level === "good" &&
          "border-primary/20 bg-primary/[0.04] ring-1 ring-primary/5",
        level === "try-again" &&
          "border-border bg-muted/50 ring-1 ring-border/60",
        className,
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        {level === "excellent" ? (
          <div
            className={cn(
              iconWrap,
              "bg-primary/15 text-primary",
            )}
            aria-hidden
          >
            <Sparkles className="size-5 sm:size-6" strokeWidth={2} />
          </div>
        ) : null}
        {level === "good" ? (
          <div
            className={cn(iconWrap, "bg-primary/12 text-primary")}
            aria-hidden
          >
            <CircleCheck className="size-5 sm:size-6" strokeWidth={2} />
          </div>
        ) : null}
        {level === "try-again" ? (
          <div
            className={cn(
              iconWrap,
              "bg-muted text-muted-foreground",
            )}
            aria-hidden
          >
            <Undo2 className="size-5 sm:size-6" strokeWidth={2} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
          <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {label}
          </p>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            {sublabel}
          </p>
        </div>
      </div>
    </div>
  );
}
