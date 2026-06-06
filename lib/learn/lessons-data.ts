import {
  getSectionsForUnit,
  UNITS,
  type UnitId,
} from "@/lib/lessons";
import { isLessonUnlocked, isSectionEntryUnlocked, isSectionFullyComplete } from "@/lib/progress/unlock";

import { UNIT_ARABIC_DECO } from "./arabic-deco";
import { getLearnLessonStatus } from "./lesson-status";

export type LearnSectionCard = {
  id: string;
  title: string;
  description: string;
  done: number;
  total: number;
  status: ReturnType<typeof getLearnLessonStatus>;
  unlocked: boolean;
  href: string | null;
};

export type LearnUnitBlock = {
  id: UnitId;
  title: string;
  description: string;
  arabicDeco: string;
  sections: LearnSectionCard[];
  done: number;
  total: number;
  allDone: boolean;
  inProgress: boolean;
};

function sectionHref(
  sectionId: string,
  lessonIds: readonly string[],
  completedIds: Set<string>,
): string {
  for (const lessonId of lessonIds) {
    if (
      isLessonUnlocked(lessonId, completedIds) &&
      !completedIds.has(lessonId)
    ) {
      return `/lessons/${lessonId}`;
    }
  }
  return `/lessons/sections/${sectionId}`;
}

export function getLearnLessonsBlocks(
  completedIds: Set<string>,
): LearnUnitBlock[] {
  return UNITS.slice()
    .sort((a, b) => a.order - b.order)
    .map((unit) => {
      const sections = getSectionsForUnit(unit.id).map((section) => {
        const total = section.lessonIds.length;
        const done = section.lessonIds.filter((id) =>
          completedIds.has(id),
        ).length;
        const unlocked = isSectionEntryUnlocked(section.id, completedIds);
        const status = getLearnLessonStatus(done, total);

        return {
          id: section.id,
          title: section.title,
          description: section.description,
          done,
          total,
          status,
          unlocked,
          href: unlocked
            ? sectionHref(section.id, section.lessonIds, completedIds)
            : null,
        };
      });

      const done = sections.reduce((sum, s) => sum + s.done, 0);
      const total = sections.reduce((sum, s) => sum + s.total, 0);
      const allDone = sections.every((s) =>
        isSectionFullyComplete(s.id, completedIds),
      );
      const inProgress = !allDone && done > 0;

      return {
        id: unit.id,
        title: unit.title,
        description: unit.description,
        arabicDeco: UNIT_ARABIC_DECO[unit.id],
        sections,
        done,
        total,
        allDone,
        inProgress,
      };
    });
}
