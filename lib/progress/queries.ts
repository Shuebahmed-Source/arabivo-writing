import { auth } from "@clerk/nextjs/server";

import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export type UserProgressRow = {
  id: string;
  clerk_user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  best_result: string;
  updated_at: string;
};

export async function fetchUserProgressForCurrentUser(): Promise<
  UserProgressRow[]
> {
  const { userId } = await auth();
  if (!userId || !isSupabaseAdminConfigured()) {
    return [];
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("clerk_user_id", userId)
      .eq("completed", true);

    if (error) {
      console.error("[user_progress]", error.message);
      return [];
    }

    return (data ?? []) as UserProgressRow[];
  } catch (e) {
    console.error("[user_progress]", e);
    return [];
  }
}

export function completedLessonIdSet(rows: UserProgressRow[]): Set<string> {
  return new Set(rows.map((r) => r.lesson_id));
}
