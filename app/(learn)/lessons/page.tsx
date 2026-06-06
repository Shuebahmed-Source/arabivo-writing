import type { Metadata } from "next";

import { LessonsView } from "@/components/learn/lessons-view";
import { getLearnLessonsBlocks } from "@/lib/learn/lessons-data";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";

export const metadata: Metadata = {
  title: "Lessons",
};

export default async function LessonsPage() {
  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);
  const blocks = getLearnLessonsBlocks(completedIds);

  return <LessonsView blocks={blocks} />;
}
