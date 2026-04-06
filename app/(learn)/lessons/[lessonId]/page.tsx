import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LessonWritingSection } from "@/components/writing/lesson-writing-section";
import {
  getLessonById,
  getLessonIds,
  getLessonShortTitle,
  getSectionById,
  getSectionMeta,
  getUnitTitle,
  lessonTypeLabel,
} from "@/lib/lessons";
import { isLessonUnlocked } from "@/lib/progress/unlock";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";

type Props = {
  params: Promise<{ lessonId: string }>;
};

export function generateStaticParams() {
  return getLessonIds().map((lessonId) => ({ lessonId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  return {
    title: lesson?.title ?? "Lesson",
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    notFound();
  }

  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);
  const unlocked = isLessonUnlocked(lesson.id, completedIds);
  if (!unlocked) {
    redirect("/lessons");
  }

  const done = completedIds.has(lesson.id);

  const sectionDef = getSectionById(lesson.sectionId);
  const idxInSection = sectionDef
    ? sectionDef.lessonIds.indexOf(lesson.id)
    : -1;
  const sectionPosition =
    idxInSection >= 0 ? idxInSection + 1 : 1;
  const sectionTotal = sectionDef?.lessonIds.length ?? 1;
  const sectionTitle =
    getSectionMeta(lesson.sectionId)?.title ?? "Section";
  const sectionHref = `/lessons/sections/${lesson.sectionId}`;

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 md:gap-5">
        <Button
          variant="ghost"
          size="lg"
          nativeButton={false}
          render={<Link href={`/lessons/sections/${lesson.sectionId}`} />}
          className="min-h-11 w-fit gap-2 px-2 sm:px-3"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to section
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {getUnitTitle(lesson.unit)} ·{" "}
              <Link
                href={`/lessons/sections/${lesson.sectionId}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {getSectionMeta(lesson.sectionId)?.title ?? "Section"}
              </Link>
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{lessonTypeLabel(lesson.type)}</Badge>
              {done ? (
                <Badge variant="default" className="gap-1">
                  <Check className="size-3" aria-hidden />
                  Completed
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <section
        className="grid gap-6 rounded-2xl border border-border/70 bg-card/35 p-5 shadow-sm ring-1 ring-primary/5 sm:p-6"
        aria-labelledby="script-heading"
      >
        <h2 id="script-heading" className="sr-only">
          Lesson script
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Arabic
            </h3>
            <p
              className="font-arabic text-5xl leading-tight text-foreground sm:text-6xl"
              dir="rtl"
              lang="ar"
            >
              {lesson.arabicText}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Transliteration
              </h3>
              <p className="text-lg font-medium text-foreground sm:text-xl">
                {lesson.transliteration}
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Meaning / note
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {lesson.englishMeaning}
              </p>
            </div>
          </div>
        </div>
      </section>

      <LessonWritingSection
        guideText={lesson.arabicText}
        lessonId={lesson.id}
        sectionTitle={sectionTitle}
        sectionHref={sectionHref}
        sectionPosition={sectionPosition}
        sectionTotal={sectionTotal}
        lessonShortTitle={getLessonShortTitle(lesson.title)}
      />
    </div>
  );
}
