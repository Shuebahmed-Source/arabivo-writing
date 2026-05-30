"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { captureEvent } from "@/components/analytics/posthog-provider";

const STORAGE_PREFIX = "arabivo_ph_co_";

function storageKeyForSession(sessionId: string): string {
  return `${STORAGE_PREFIX}${sessionId}`;
}

/**
 * Fires `checkout_completed` once per Stripe Checkout session (`session_id` in URL).
 * Reloading the same success URL does not duplicate; a new checkout gets a new `session_id`.
 * Legacy URLs without `session_id` dedupe by a fixed storage key (reload-safe only).
 */
export function CheckoutSuccessAnalytics() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      if (typeof window === "undefined") return;
      const key = storageKeyForSession(sessionId);
      if (sessionStorage.getItem(key) === "1") return;
      captureEvent("checkout_completed", { session_id: sessionId });
      sessionStorage.setItem(key, "1");
      return;
    }

    if (typeof window === "undefined") return;
    const legacyKey = `${STORAGE_PREFIX}legacy_checkout_success`;
    if (sessionStorage.getItem(legacyKey) === "1") return;
    captureEvent("checkout_completed");
    sessionStorage.setItem(legacyKey, "1");
  }, [searchParams]);

  return null;
}
