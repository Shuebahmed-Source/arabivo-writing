import { getLessonById, getSectionById } from "@/lib/lessons";

import { isLessonUnlocked } from "./unlock";

/**
 * Where to send the user after a successful save. `completedLessonIds` must include
 * the lesson that was just completed.
 *
 * Next is always the following lesson in section order (supports replay when later
 * lessons are already complete). After the section’s final lesson, returns this
 * section’s hub — not the next section.
 */
export function getPostCompletionPath(
  completedLessonId: string,
  completedLessonIds: Set<string>,
): string {
  const lesson = getLessonById(completedLessonId);
  if (!lesson) return "/lessons";

  const section = getSectionById(lesson.sectionId);
  if (!section) return "/lessons";

  const idx = section.lessonIds.indexOf(completedLessonId);
  if (idx < 0) return "/lessons";

  const nextIdx = idx + 1;
  if (nextIdx < section.lessonIds.length) {
    const nextId = section.lessonIds[nextIdx];
    if (isLessonUnlocked(nextId, completedLessonIds)) {
      return `/lessons/${nextId}`;
    }
    return `/lessons/sections/${section.id}`;
  }

  return `/lessons/sections/${section.id}`;
}
