"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { getLessonById, getSectionIds } from "@/lib/lessons";
import { getPostCompletionPath } from "@/lib/progress/post-completion";
import { isLessonUnlocked } from "@/lib/progress/unlock";
import { fetchUserSubscriptionForCurrentUser } from "@/lib/subscriptions/queries";
import { isPaidSubscriptionStatus } from "@/lib/subscriptions/status";
import { isStripeConfigured } from "@/lib/stripe/server";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export type RecordLessonResult =
  | { ok: true; nextPath: string }
  | { ok: false; message: string };

function mapSupabaseError(err: {
  message?: string;
  code?: string;
  details?: string;
}): string {
  const msg = (err.message ?? "").toLowerCase();
  const code = err.code ?? "";

  if (
    msg.includes("does not exist") ||
    code === "42P01" ||
    msg.includes("relation") && msg.includes("user_progress")
  ) {
    return "Database table user_progress is missing. In Supabase, open SQL Editor and run supabase/migrations/20260403120000_user_progress.sql (or supabase db push).";
  }

  if (
    msg.includes("row-level security") ||
    msg.includes("violates row-level security") ||
    code === "42501"
  ) {
    return "Supabase blocked the write. Put the service_role secret (Project Settings → API) in SUPABASE_SERVICE_ROLE_KEY—not the anon key—and restart the dev server.";
  }

  if (
    msg.includes("jwt") ||
    msg.includes("invalid api key") ||
    code === "PGRST301" ||
    msg.includes("invalid authentication")
  ) {
    return "Supabase rejected the API key. Copy service_role from Supabase → Project Settings → API into SUPABASE_SERVICE_ROLE_KEY and ensure NEXT_PUBLIC_SUPABASE_URL matches the same project.";
  }

  if (process.env.NODE_ENV === "development") {
    const detail = err.details ? ` ${err.details}` : "";
    return `Could not save progress: ${err.message ?? "unknown error"}${code ? ` [${code}]` : ""}${detail}`;
  }

  return "Could not save progress. Try again.";
}

function mergeBest(
  prev: string | null | undefined,
  next: "excellent" | "good",
): "excellent" | "good" {
  if (prev === "excellent") return "excellent";
  return next;
}

export async function recordLessonCompletion(
  lessonId: string,
  result: "excellent" | "good",
): Promise<RecordLessonResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "You need to be signed in to save progress." };
  }

  if (isStripeConfigured()) {
    const sub = await fetchUserSubscriptionForCurrentUser();
    if (!isPaidSubscriptionStatus(sub?.status)) {
      return {
        ok: false,
        message: "Subscribe to access lessons and save progress.",
      };
    }
  }

  if (!getLessonById(lessonId)) {
    return { ok: false, message: "Unknown lesson." };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      message:
        "Progress saving is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (use the service_role secret, not the anon key), then restart `next dev`.",
    };
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: existingRows, error: selectError } = await supabase
      .from("user_progress")
      .select("lesson_id, best_result")
      .eq("clerk_user_id", userId)
      .eq("completed", true);

    if (selectError) {
      console.error("[recordLessonCompletion] select", selectError);
      return { ok: false, message: mapSupabaseError(selectError) };
    }

    const completedIds = new Set(
      (existingRows ?? []).map((r) => r.lesson_id as string),
    );

    if (!isLessonUnlocked(lessonId, completedIds)) {
      return { ok: false, message: "Complete the previous lesson first." };
    }

    const previousBest = (existingRows ?? []).find(
      (r) => r.lesson_id === lessonId,
    )?.best_result as string | undefined;

    const bestResult = mergeBest(previousBest, result);
    const now = new Date().toISOString();

    const { error } = await supabase.from("user_progress").upsert(
      {
        clerk_user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: now,
        best_result: bestResult,
        updated_at: now,
      },
      { onConflict: "clerk_user_id,lesson_id" },
    );

    if (error) {
      console.error("[recordLessonCompletion] upsert", error);
      return { ok: false, message: mapSupabaseError(error) };
    }

    completedIds.add(lessonId);
    const nextPath = getPostCompletionPath(lessonId, completedIds);

    revalidatePath("/dashboard");
    revalidatePath("/lessons");
    revalidatePath(`/lessons/${lessonId}`);
    for (const sid of getSectionIds()) {
      revalidatePath(`/lessons/sections/${sid}`);
    }

    return { ok: true, nextPath };
  } catch (e) {
    console.error("[recordLessonCompletion]", e);
    const msg =
      e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV === "development") {
      return { ok: false, message: `Could not save progress: ${msg}` };
    }
    return { ok: false, message: "Could not save progress. Try again." };
  }
}
