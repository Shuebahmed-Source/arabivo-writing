import { cn } from "@/lib/utils";
import {
  formatBestResult,
  referenceArabicFontSize,
} from "@/lib/writing/lesson-display";

type LessonPracticeSidebarProps = {
  arabicText: string;
  englishMeaning: string;
  bestResult?: string;
  completed: boolean;
};

export function LessonPracticeSidebar({
  arabicText,
  englishMeaning,
  bestResult,
  completed,
}: LessonPracticeSidebarProps) {
  const bestLabel = formatBestResult(bestResult);

  return (
    <aside
      className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm ring-1 ring-primary/5 sm:p-5 lg:sticky lg:top-20 lg:self-start"
      aria-label="Lesson reference and progress"
    >
      <section>
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Reference
        </h2>
        <p
          className="mt-2 font-arabic leading-snug text-foreground"
          style={{ fontSize: `${referenceArabicFontSize(arabicText)}px` }}
          dir="rtl"
          lang="ar"
        >
          {arabicText}
        </p>
      </section>

      <section className="border-t border-border/60 pt-4">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Note
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {englishMeaning}
        </p>
      </section>

      <section className="border-t border-border/60 pt-4">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Progress
        </h2>
        <dl className="mt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Best</dt>
            <dd
              className={cn(
                "font-medium",
                bestLabel === "Excellent"
                  ? "text-primary"
                  : bestLabel === "Good"
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {bestLabel ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-foreground">
              {completed ? "Completed" : "In progress"}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}
