import { getLessonById, getSectionsOrdered } from "@/lib/lessons";

import { isLessonUnlocked } from "./unlock";

/**
 * Where to send the user after a successful save. `completedLessonIds` must include
 * the lesson that was just completed.
 *
 * Skips already-completed items in the same section (e.g. after curriculum reorder /
 * migration) and lands on the first incomplete unlocked item, or the next section hub.
 */
export function getPostCompletionPath(
  completedLessonId: string,
  completedLessonIds: Set<string>,
): string {
  const lesson = getLessonById(completedLessonId);
  if (!lesson) return "/lessons";

  const sections = getSectionsOrdered();
  const section = sections.find((s) => s.id === lesson.sectionId);
  if (!section) return "/lessons";

  const idx = section.lessonIds.indexOf(completedLessonId);
  if (idx < 0) return "/lessons";

  for (let i = idx + 1; i < section.lessonIds.length; i++) {
    const nid = section.lessonIds[i];
    if (!isLessonUnlocked(nid, completedLessonIds)) break;
    if (!completedLessonIds.has(nid)) {
      return `/lessons/${nid}`;
    }
  }

  const sectionIndex = sections.findIndex((s) => s.id === section.id);
  const nextSection = sections[sectionIndex + 1];
  if (nextSection) {
    return `/lessons/sections/${nextSection.id}`;
  }

  return "/lessons";
}
