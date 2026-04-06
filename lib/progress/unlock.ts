import {
  getLessonById,
  getSectionsOrdered,
  type UnitId,
} from "@/lib/lessons";

/**
 * Section-based unlock:
 * - First lesson of the first section is always available.
 * - First lesson of any later section requires every lesson in the previous section completed.
 * - Within a section, lesson k requires lesson k−1 completed.
 */
export function isLessonUnlocked(
  lessonId: string,
  completedLessonIds: Set<string>,
): boolean {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;

  const sections = getSectionsOrdered();
  const section = sections.find((s) => s.id === lesson.sectionId);
  if (!section || section.lessonIds.length === 0) return false;

  const idxInSection = section.lessonIds.indexOf(lessonId);
  if (idxInSection < 0) return false;

  if (idxInSection > 0) {
    const prevId = section.lessonIds[idxInSection - 1];
    return completedLessonIds.has(prevId);
  }

  const sectionIndex = sections.findIndex((s) => s.id === section.id);
  if (sectionIndex <= 0) return true;

  const prevSection = sections[sectionIndex - 1];
  return prevSection.lessonIds.every((id) => completedLessonIds.has(id));
}

/** True when the user may open the section page (first item in section is unlocked). */
export function isSectionEntryUnlocked(
  sectionId: string,
  completedLessonIds: Set<string>,
): boolean {
  const sections = getSectionsOrdered();
  const section = sections.find((s) => s.id === sectionId);
  if (!section || section.lessonIds.length === 0) return false;
  const firstId = section.lessonIds[0];
  return isLessonUnlocked(firstId, completedLessonIds);
}

/** Every lesson in the section has a completion row. */
export function isSectionFullyComplete(
  sectionId: string,
  completedLessonIds: Set<string>,
): boolean {
  const sections = getSectionsOrdered();
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return false;
  return section.lessonIds.every((id) => completedLessonIds.has(id));
}

/** True when the first lesson of the unit is reachable. */
export function isUnitUnlocked(
  unitId: UnitId,
  completedLessonIds: Set<string>,
): boolean {
  const sections = getSectionsOrdered().filter((s) => s.unitId === unitId);
  if (sections.length === 0) return false;
  const firstLessonId = sections[0].lessonIds[0];
  if (!firstLessonId) return false;
  return isLessonUnlocked(firstLessonId, completedLessonIds);
}
