import {
  getSectionsForUnit,
  getSectionsOrdered,
  lessons,
  type DashboardUnit,
  type UnitId,
} from "@/lib/lessons";
import { getDashboardUnits } from "@/lib/progress/dashboard-units";
import {
  isLessonUnlocked,
  isSectionFullyComplete,
  isUnitUnlocked,
} from "@/lib/progress/unlock";

import { UNIT_ARABIC_DECO } from "./arabic-deco";

export type LearnDashboardStats = {
  overallPct: number;
  lessonsDone: number;
  lessonsTotal: number;
  sectionsDone: number;
  sectionsTotal: number;
};

export type LearnUpNext = {
  unitId: UnitId;
  title: string;
  description: string;
  arabicDeco: string;
  done: number;
  total: number;
  href: string;
};

export type LearnDashboardUnitCard = DashboardUnit & {
  arabicDeco: string;
  pct: number;
  inProgress: boolean;
  href: string | null;
};

function getContinueHref(
  unitId: UnitId,
  completedIds: Set<string>,
): string | null {
  const sections = getSectionsForUnit(unitId);
  for (const section of sections) {
    for (const lessonId of section.lessonIds) {
      if (
        isLessonUnlocked(lessonId, completedIds) &&
        !completedIds.has(lessonId)
      ) {
        return `/lessons/${lessonId}`;
      }
    }
  }
  const firstSection = sections[0];
  if (firstSection) {
    return `/lessons/sections/${firstSection.id}`;
  }
  return `/lessons#${unitId}`;
}

export function getLearnDashboardStats(
  completedIds: Set<string>,
): LearnDashboardStats {
  const allSections = getSectionsOrdered();
  const lessonsTotal = lessons.length;
  const lessonsDone = lessons.filter((l) => completedIds.has(l.id)).length;
  const sectionsTotal = allSections.length;
  const sectionsDone = allSections.filter((s) =>
    isSectionFullyComplete(s.id, completedIds),
  ).length;
  const overallPct =
    lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

  return {
    overallPct,
    lessonsDone,
    lessonsTotal,
    sectionsDone,
    sectionsTotal,
  };
}

export function getLearnUpNext(
  completedIds: Set<string>,
): LearnUpNext | null {
  const units = getDashboardUnits(completedIds);

  for (const unit of units) {
    if (unit.locked) continue;
    if (unit.completedCount >= unit.lessonCount) continue;

    const href = getContinueHref(unit.id, completedIds);
    if (!href) continue;

    return {
      unitId: unit.id,
      title: unit.title,
      description: unit.description,
      arabicDeco: UNIT_ARABIC_DECO[unit.id],
      done: unit.completedCount,
      total: unit.lessonCount,
      href,
    };
  }

  return null;
}

export function getLearnDashboardUnitCards(
  completedIds: Set<string>,
): LearnDashboardUnitCard[] {
  return getDashboardUnits(completedIds).map((unit) => {
    const pct =
      unit.lessonCount > 0
        ? Math.round((unit.completedCount / unit.lessonCount) * 100)
        : 0;
    const inProgress = !unit.locked && unit.completedCount < unit.lessonCount;
    const unlocked = isUnitUnlocked(unit.id, completedIds);

    return {
      ...unit,
      arabicDeco: UNIT_ARABIC_DECO[unit.id],
      pct,
      inProgress,
      href: unlocked ? `/lessons#${unit.id}` : null,
    };
  });
}
