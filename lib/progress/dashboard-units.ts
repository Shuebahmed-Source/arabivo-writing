import { lessons, UNITS, type DashboardUnit } from "@/lib/lessons";

import { isUnitUnlocked } from "./unlock";

export function getDashboardUnits(
  completedLessonIds: Set<string>,
): DashboardUnit[] {
  return UNITS.slice()
    .sort((a, b) => a.order - b.order)
    .map((u) => {
      const unitLessons = lessons.filter((l) => l.unit === u.id);
      const lessonCount = unitLessons.length;
      const completedCount = unitLessons.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;

      return {
        id: u.id,
        title: u.title,
        description: u.description,
        lessonCount,
        completedCount,
        locked: !isUnitUnlocked(u.id, completedLessonIds),
      };
    });
}
