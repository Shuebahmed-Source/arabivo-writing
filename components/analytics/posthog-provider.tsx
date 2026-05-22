"use client";

import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useRef } from "react";

const DEFAULT_HOST = "https://us.i.posthog.com";

let clientInited = false;

function posthogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || undefined;
}

function posthogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_HOST;
}

function initPostHogClient(): boolean {
  if (typeof window === "undefined") return false;
  const key = posthogKey();
  if (!key) return false;
  if (clientInited) return true;

  posthog.init(key, {
    api_host: posthogHost(),
    capture_pageview: false,
    disable_session_recording: true,
    persistence: "localStorage",
  });
  clientInited = true;
  return true;
}

/** Fire custom events; safe no-op when PostHog is not configured or not inited yet. */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!posthogKey()) return;
  initPostHogClient();
  posthog.capture(event, properties);
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!posthogKey()) return;
    if (!initPostHogClient()) return;

    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    if (lastUrl.current === url) return;
    lastUrl.current = url;

    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  initPostHogClient();

  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!posthogKey()) return;
    if (!initPostHogClient()) return;
    if (!isLoaded) return;

    if (user?.id) {
      posthog.identify(user.id);
    } else {
      posthog.reset();
    }
  }, [isLoaded, user?.id]);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
