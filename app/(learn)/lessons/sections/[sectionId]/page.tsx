import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getLessonById,
  getSectionById,
  getSectionIds,
  getSectionsOrdered,
  getUnitTitle,
} from "@/lib/lessons";
import { isPreviewOrLocalDevBypassServer } from "@/lib/env/dev-access";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";
import {
  isLessonUnlocked,
  isSectionEntryUnlocked,
  isSectionFullyComplete,
} from "@/lib/progress/unlock";

type Props = {
  params: Promise<{ sectionId: string }>;
};

export function generateStaticParams() {
  return getSectionIds().map((sectionId) => ({ sectionId }));
}

function getContinueLessonId(
  lessonIds: readonly string[],
  completedIds: Set<string>,
): string | null {
  for (const id of lessonIds) {
    if (!isLessonUnlocked(id, completedIds)) return null;
    if (!completedIds.has(id)) return id;
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sectionId } = await params;
  const section = getSectionById(sectionId);
  return {
    title: section?.title ?? "Section",
  };
}

export default async function SectionPage({ params }: Props) {
  const { sectionId } = await params;
  const section = getSectionById(sectionId);
  if (!section) {
    notFound();
  }

  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);

  const flowBypass = await isPreviewOrLocalDevBypassServer();
  if (
    !flowBypass &&
    !isSectionEntryUnlocked(section.id, completedIds)
  ) {
    redirect("/lessons");
  }

  const continueId = getContinueLessonId(section.lessonIds, completedIds);
  const allDone = isSectionFullyComplete(section.id, completedIds);
  const sections = getSectionsOrdered();
  const sectionIndex = sections.findIndex((s) => s.id === section.id);
  const nextSection = sections[sectionIndex + 1];

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="lg"
          nativeButton={false}
          render={<Link href="/lessons" />}
          className="min-h-11 w-fit gap-2 px-2 sm:px-3"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All lessons
        </Button>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {getUnitTitle(section.unitId)}
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {section.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {section.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {continueId ? (
          <Button
            size="lg"
            className="min-h-12 w-full touch-manipulation sm:w-auto sm:min-h-11"
            nativeButton={false}
            render={<Link href={`/lessons/${continueId}`} />}
          >
            Continue
            <ChevronRight className="ms-1 size-4" aria-hidden />
          </Button>
        ) : null}
        {allDone && nextSection ? (
          <Button
            variant="outline"
            size="lg"
            className="min-h-12 w-full touch-manipulation sm:w-auto sm:min-h-11"
            nativeButton={false}
            render={<Link href={`/lessons/sections/${nextSection.id}`} />}
          >
            Next section
            <ChevronRight className="ms-1 size-4" aria-hidden />
          </Button>
        ) : null}
        {allDone && !nextSection ? (
          <Button
            variant="outline"
            size="lg"
            className="min-h-12 w-full touch-manipulation sm:w-auto sm:min-h-11"
            nativeButton={false}
            render={<Link href="/lessons" />}
          >
            Back to lessons
          </Button>
        ) : null}
      </div>

      <ul className="flex flex-col gap-3">
        {section.lessonIds.map((lessonId) => {
          const lesson = getLessonById(lessonId);
          if (!lesson) return null;
          const unlocked = isLessonUnlocked(lessonId, completedIds);
          const done = completedIds.has(lessonId);

          const row = (
            <Card
              size="sm"
              className={
                unlocked
                  ? "transition-colors hover:bg-muted/50"
                  : "bg-muted/25 opacity-80"
              }
            >
              <CardHeader className="flex-row items-center gap-3 space-y-0 pb-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      {lesson.title}
                    </CardTitle>
                    {done ? (
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
                  <CardDescription className="line-clamp-2">
                    {lesson.englishMeaning}
                  </CardDescription>
                </div>
                {unlocked ? (
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                ) : null}
              </CardHeader>
            </Card>
          );

          return (
            <li key={lessonId}>
              {unlocked ? (
                <Link
                  href={`/lessons/${lessonId}`}
                  className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {row}
                </Link>
              ) : (
                <div
                  className="rounded-xl"
                  title="Complete the previous item in this section to unlock"
                >
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
