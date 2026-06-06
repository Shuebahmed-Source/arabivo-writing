import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SectionHubView } from "@/components/learn/section-hub-view";
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

  const lessons = section.lessonIds
    .map((lessonId) => {
      const lesson = getLessonById(lessonId);
      if (!lesson) return null;
      const unlocked = isLessonUnlocked(lessonId, completedIds);
      const done = completedIds.has(lessonId);
      return {
        lesson,
        unlocked,
        done,
        href: unlocked ? `/lessons/${lessonId}` : null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <SectionHubView
      unitTitle={getUnitTitle(section.unitId)}
      sectionTitle={section.title}
      sectionDescription={section.description}
      continueHref={continueId ? `/lessons/${continueId}` : null}
      nextSectionHref={
        nextSection ? `/lessons/sections/${nextSection.id}` : null
      }
      allDone={allDone}
      hasNextSection={Boolean(nextSection)}
      lessons={lessons}
    />
  );
}
