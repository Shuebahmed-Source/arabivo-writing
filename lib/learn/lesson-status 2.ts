export type LearnLessonStatus = "done" | "progress" | "available";

export function getLearnLessonStatus(
  done: number,
  total: number,
): LearnLessonStatus {
  if (total > 0 && done === total) return "done";
  if (done > 0) return "progress";
  return "available";
}
