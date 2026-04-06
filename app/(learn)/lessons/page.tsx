import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronRight, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UNITS,
  getSectionsForUnit,
  type UnitId,
} from "@/lib/lessons";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";
import { isSectionEntryUnlocked, isSectionFullyComplete } from "@/lib/progress/unlock";

export const metadata: Metadata = {
  title: "Lessons",
};

function sectionProgress(
  sectionId: string,
  lessonIds: readonly string[],
  completedIds: Set<string>,
): { done: number; total: number } {
  const total = lessonIds.length;
  const done = lessonIds.filter((id) => completedIds.has(id)).length;
  return { done, total };
}

export default async function LessonsPage() {
  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);

  const unitsSorted = UNITS.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-1 flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Lessons
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Open a <span className="font-medium text-foreground">section</span>,
          then work through letters in order. After{" "}
          <span className="font-medium text-foreground">Good</span> or{" "}
          <span className="font-medium text-foreground">Excellent</span>, you
          move to the next item automatically. Finish every item in a section
          to unlock the next section.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {unitsSorted.map((unit) => (
          <section
            key={unit.id}
            className="flex flex-col gap-4"
            aria-labelledby={`unit-${unit.id}`}
          >
            <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
              <h2
                id={`unit-${unit.id}`}
                className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
              >
                {unit.title}
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {unit.description}
              </p>
            </div>

            <ul className="grid list-none gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {getSectionsForUnit(unit.id as UnitId).map((section) => {
                const unlocked = isSectionEntryUnlocked(section.id, completedIds);
                const complete = isSectionFullyComplete(section.id, completedIds);
                const { done, total } = sectionProgress(
                  section.id,
                  section.lessonIds,
                  completedIds,
                );

                const card = (
                  <Card
                    size="sm"
                    className={
                      unlocked
                        ? "h-full transition-colors hover:bg-muted/50"
                        : "h-full bg-muted/25 opacity-80"
                    }
                  >
                    <CardHeader className="flex h-full flex-row items-stretch gap-3 space-y-0 pb-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base sm:text-lg">
                            {section.title}
                          </CardTitle>
                          {complete ? (
                            <Badge variant="default" className="gap-1">
                              <Check className="size-3" aria-hidden />
                              Done
                            </Badge>
                          ) : null}
                          {!unlocked ? (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="size-3" aria-hidden />
                              Locked
                            </Badge>
                          ) : null}
                        </div>
                        <CardDescription className="flex-1">
                          {section.description}
                        </CardDescription>
                        <p className="text-xs font-medium text-muted-foreground">
                          Progress {done}/{total}
                        </p>
                      </div>
                      {unlocked ? (
                        <ChevronRight
                          className="mt-1 size-5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      ) : null}
                    </CardHeader>
                  </Card>
                );

                return (
                  <li key={section.id}>
                    {unlocked ? (
                      <Link
                        href={`/lessons/sections/${section.id}`}
                        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {card}
                      </Link>
                    ) : (
                      <div
                        className="block h-full rounded-xl"
                        title="Complete the previous section to unlock"
                      >
                        {card}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
