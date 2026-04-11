import { auth } from "@clerk/nextjs/server";

import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

/** Host only — never log keys. */
function supabaseUrlHostForLogs(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw).host;
  } catch {
    return "(unparseable NEXT_PUBLIC_SUPABASE_URL)";
  }
}

function serializeCaughtError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    const out: Record<string, unknown> = {
      exceptionClass: err.constructor?.name ?? "Error",
      message: err.message,
      name: err.name,
    };
    const c = err.cause;
    if (c !== undefined && c !== null) {
      out.cause =
        c instanceof Error
          ? {
              class: c.constructor?.name,
              message: c.message,
              name: c.name,
            }
          : { raw: String(c) };
    }
    if (process.env.NODE_ENV === "development" && err.stack) {
      out.stack = err.stack;
    }
    return out;
  }
  return { raw: String(err) };
}

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
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[user_progress] skip fetch: no Clerk userId (signed out or auth() empty)",
      );
    }
    return [];
  }

  if (!isSupabaseAdminConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[user_progress] skip fetch: Supabase admin not configured (check NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)",
      );
    }
    return [];
  }

  const logBase = {
    clerkUserIdQueried: userId,
    supabaseHost: supabaseUrlHostForLogs(),
    table: "user_progress",
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("clerk_user_id", userId)
      .eq("completed", true);

    if (error) {
      // PostgREST / Supabase API returned an error object (HTTP reached Supabase).
      const err = error as {
        message: string;
        code?: string;
        details?: string | null;
        hint?: string | null;
      };
      console.error("[user_progress] Supabase select returned error", {
        ...logBase,
        kind: "postgrest_or_api_error",
        message: err.message,
        code: err.code ?? null,
        details: err.details ?? null,
        hint: err.hint ?? null,
        note:
          "If code is PGRST301 or mentions JWT, the service_role key may be wrong or anon was used. RLS blocks usually surface as permission errors, not empty fetch.",
      });
      return [];
    }

    return (data ?? []) as UserProgressRow[];
  } catch (e) {
    // Network failure, TLS, DNS, timeout, etc. — often TypeError: fetch failed
    console.error("[user_progress] select threw (likely transport / TLS / DNS)", {
      ...logBase,
      kind: "exception_during_request",
      ...serializeCaughtError(e),
      note:
        "fetch failed: check VPN/firewall, URL reachability, Node/OpenSSL, and that NEXT_PUBLIC_SUPABASE_URL matches the project. Not RLS (service role bypasses RLS). Missing user returns empty rows, not an exception.",
    });
    return [];
  }
}

export function completedLessonIdSet(rows: UserProgressRow[]): Set<string> {
  return new Set(rows.map((r) => r.lesson_id));
}
