import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { isPreviewOrLocalDevBypassServer } from "@/lib/env/dev-access";
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
  const flowBypass = await isPreviewOrLocalDevBypassServer();
  const unlocked =
    flowBypass || isLessonUnlocked(lesson.id, completedIds);
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
    <div className="flex flex-1 flex-col gap-4 md:gap-5">
      <header className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/lessons/sections/${lesson.sectionId}`} />}
          className="h-9 w-fit gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to section
        </Button>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground sm:text-sm">
            {getUnitTitle(lesson.unit)} ·{" "}
            <Link
              href={`/lessons/sections/${lesson.sectionId}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {getSectionMeta(lesson.sectionId)?.title ?? "Section"}
            </Link>
          </p>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {lesson.title}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-xs font-normal">
              {lessonTypeLabel(lesson.type)}
            </Badge>
            {done ? (
              <Badge variant="default" className="gap-1 text-xs">
                <Check className="size-3" aria-hidden />
                Completed
              </Badge>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,17.5rem)] lg:items-start lg:gap-6">
        <div className="min-w-0">
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

        <section
          className="rounded-xl border border-border/70 bg-card/40 p-4 shadow-sm ring-1 ring-primary/5 sm:p-4 lg:sticky lg:top-20 lg:self-start"
          aria-labelledby="script-heading"
        >
          <h2
            id="script-heading"
            className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Lesson reference
          </h2>
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-3">
            <div>
              <h3 className="sr-only">Arabic</h3>
              <p
                className="font-arabic text-4xl leading-none text-foreground sm:text-5xl lg:text-4xl xl:text-5xl"
                dir="rtl"
                lang="ar"
              >
                {lesson.arabicText}
              </p>
            </div>
            <div className="border-t border-border/60 pt-3 sm:pt-4 lg:pt-3">
              <h3 className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Transliteration
              </h3>
              <p className="mt-0.5 text-base font-medium text-foreground">
                {lesson.transliteration}
              </p>
            </div>
            <div className="border-t border-border/60 pt-3 sm:pt-4 lg:pt-3">
              <h3 className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Meaning / note
              </h3>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                {lesson.englishMeaning}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
