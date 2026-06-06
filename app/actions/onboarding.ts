"use server";

import { auth } from "@clerk/nextjs/server";

import type { OnboardingAnswers } from "@/lib/onboarding/types";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export type SaveOnboardingResult =
  | { ok: true }
  | { ok: false; message: string };

export type OnboardingRow = {
  clerk_user_id: string;
  answers: OnboardingAnswers;
  first_trace_completed: boolean;
  first_trace_at: string | null;
  demo_completed_at: string | null;
};

export async function fetchOnboardingForCurrentUser(): Promise<OnboardingRow | null> {
  const { userId } = await auth();
  if (!userId || !isSupabaseAdminConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_onboarding")
    .select(
      "clerk_user_id, answers, first_trace_completed, first_trace_at, demo_completed_at",
    )
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as OnboardingRow;
}

export async function saveOnboardingProfile(
  answers: OnboardingAnswers,
  firstTraceCompleted: boolean,
): Promise<SaveOnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Sign in to save your plan." };
  }
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, message: "Database is not configured." };
  }

  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("user_onboarding").upsert(
    {
      clerk_user_id: userId,
      answers,
      first_trace_completed: firstTraceCompleted,
      first_trace_at: firstTraceCompleted ? now : null,
      updated_at: now,
    },
    { onConflict: "clerk_user_id" },
  );

  if (error) {
    return { ok: false, message: "Could not save your onboarding answers." };
  }
  return { ok: true };
}

export async function markDemoCompleted(): Promise<SaveOnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Sign in to continue." };
  }
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, message: "Database is not configured." };
  }

  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("user_onboarding").upsert(
    {
      clerk_user_id: userId,
      demo_completed_at: now,
      updated_at: now,
    },
    { onConflict: "clerk_user_id" },
  );

  if (error) {
    return { ok: false, message: "Could not save demo progress." };
  }
  return { ok: true };
}
