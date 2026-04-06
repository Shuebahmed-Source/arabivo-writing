import type { Metadata } from "next";

import { LearningUnitsGrid } from "@/components/dashboard/learning-units-grid";
import { getDashboardUnits } from "@/lib/progress/dashboard-units";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);
  const units = getDashboardUnits(completedIds);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your learning path
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Complete lessons in order (Good or Excellent on Check). Your place is
          stored per signed-in account.
        </p>
      </header>
      <LearningUnitsGrid units={units} />
    </div>
  );
}
