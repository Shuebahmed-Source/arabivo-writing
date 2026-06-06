import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { LessonPracticeSidebar } from "@/components/writing/lesson-practice-sidebar";
import { LessonWritingSection } from "@/components/writing/lesson-writing-section";
import {
  getLessonById,
  getLessonIds,
  getLessonShortTitle,
  getSectionById,
  getSectionMeta,
  getUnitTitle,
} from "@/lib/lessons";
import { isLessonUnlocked } from "@/lib/progress/unlock";
import { isPreviewOrLocalDevBypassServer } from "@/lib/env/dev-access";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";
import {
  countArabicLetters,
  practiceKindLabel,
} from "@/lib/writing/lesson-display";

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

  const progressRow = rows.find((r) => r.lesson_id === lesson.id);
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
  const lessonShortTitle = getLessonShortTitle(lesson.title);
  const letterCount = countArabicLetters(lesson.arabicText);
  const letterCountLabel =
    letterCount === 1 ? "1 letter" : `${letterCount} letters`;

  return (
    <div className="learn-main-default flex flex-1 flex-col gap-5 md:gap-6">
      <header className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <nav
          className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/lessons"
            className="shrink-0 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Lessons
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
          <Link
            href={sectionHref}
            className="min-w-0 truncate hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {sectionTitle}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
          <span className="min-w-0 truncate font-medium text-foreground">
            {lessonShortTitle}
          </span>
        </nav>

        <div className="flex shrink-0 items-center gap-3 text-xs sm:text-sm">
          {done ? (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden
              />
              Saved
            </span>
          ) : null}
          <span className="tabular-nums text-muted-foreground">
            {String(sectionPosition).padStart(2, "0")} /{" "}
            {String(sectionTotal).padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,17rem)] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
          <div className="space-y-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {practiceKindLabel(lesson.type)}
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {lesson.transliteration}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {lesson.englishMeaning.split(".")[0]?.trim() ||
                lesson.englishMeaning}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {letterCountLabel}
              </span>
              {done ? (
                <Badge variant="default" className="gap-1 text-xs">
                  <Check className="size-3" aria-hidden />
                  Completed
                </Badge>
              ) : null}
            </div>
          </div>

          <LessonWritingSection
            guideText={lesson.arabicText}
            lessonId={lesson.id}
            sectionTitle={sectionTitle}
            sectionHref={sectionHref}
            sectionPosition={sectionPosition}
            sectionTotal={sectionTotal}
            lessonShortTitle={lessonShortTitle}
          />
        </div>

        <LessonPracticeSidebar
          arabicText={lesson.arabicText}
          englishMeaning={lesson.englishMeaning}
          bestResult={progressRow?.best_result}
          completed={done}
        />
      </div>
    </div>
  );
}
