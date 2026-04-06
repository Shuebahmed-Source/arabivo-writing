import { auth } from "@clerk/nextjs/server";

import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

import type { UserSubscriptionRow } from "@/lib/subscriptions/types";

export type { UserSubscriptionRow } from "@/lib/subscriptions/types";

export async function fetchUserSubscriptionForCurrentUser(): Promise<UserSubscriptionRow | null> {
  const { userId } = await auth();
  if (!userId || !isSupabaseAdminConfigured()) {
    return null;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[user_subscriptions]", error.message);
      return null;
    }

    return data as UserSubscriptionRow | null;
  } catch (e) {
    console.error("[user_subscriptions]", e);
    return null;
  }
}
