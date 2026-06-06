"use client";

import { useAuth, useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  markDemoCompleted,
  saveOnboardingProfile,
} from "@/app/actions/onboarding";
import {
  clearOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/session";

type NavigateArgs = {
  session?: { currentTask?: unknown } | null;
  decorateUrl: (url: string) => string;
};

export function OnboardingSsoCallbackHandler() {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const navigatingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualContinue, setShowManualContinue] = useState(false);

  const goSubscribe = useCallback(async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setError(null);

    try {
      const session = readOnboardingSession();
      if (session) {
        await saveOnboardingProfile(
          session.answers,
          session.firstTraceCompleted,
        );
        clearOnboardingSession();
      }
      await markDemoCompleted();
    } catch {
      // Still send the user to subscribe — profile can be saved later.
    }

    const target = "/subscribe";
    router.replace(target);
    router.refresh();

    window.setTimeout(() => {
      if (window.location.pathname.includes("/onboarding/sso-callback")) {
        window.location.assign(target);
      }
    }, 1200);
  }, [router]);

  const handleNavigate = useCallback(
    async ({ session }: NavigateArgs) => {
      if (session?.currentTask) {
        navigatingRef.current = false;
        setShowManualContinue(true);
        setError(
          "Clerk needs one more step (check for a popup or captcha above). You can also continue below.",
        );
        return;
      }
      await goSubscribe();
    },
    [goSubscribe],
  );

  const processCallback = useCallback(async () => {
    if (!clerk.loaded) return;

    try {
      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: handleNavigate });
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: handleNavigate });
        return;
      }

      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        const signInStatus = signIn.status as typeof signIn.status | "complete";
        if (signInStatus === "complete") {
          await signIn.finalize({ navigate: handleNavigate });
        }
        return;
      }

      if (signIn.isTransferable) {
        await signUp.create({ transfer: true });
        const signUpStatus = signUp.status as typeof signUp.status | "complete";
        if (signUpStatus === "complete") {
          await signUp.finalize({ navigate: handleNavigate });
        }
        return;
      }

      const sessionId =
        signIn.existingSession?.sessionId ??
        signUp.existingSession?.sessionId;
      if (sessionId) {
        await clerk.setActive({
          session: sessionId,
          navigate: handleNavigate,
        });
        return;
      }

      if (isSignedIn) {
        await goSubscribe();
      }
    } catch {
      navigatingRef.current = false;
      setShowManualContinue(true);
      setError("Something went wrong finishing sign-up. Try continuing below.");
    }
  }, [
    clerk,
    goSubscribe,
    handleNavigate,
    isSignedIn,
    signIn,
    signUp,
  ]);

  useEffect(() => {
    void processCallback();
  }, [
    clerk.loaded,
    signIn.status,
    signUp.status,
    signUp.isTransferable,
    signIn.isTransferable,
    isSignedIn,
    processCallback,
  ]);

  useEffect(() => {
    if (!clerk.loaded) return;
    const timeout = window.setTimeout(() => {
      if (navigatingRef.current) return;
      if (isSignedIn) {
        void goSubscribe();
        return;
      }
      setShowManualContinue(true);
      setError(
        "Sign-in is taking a while. If you already signed in with Google, continue below.",
      );
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [clerk.loaded, goSubscribe, isSignedIn]);

  return (
    <div className="onb-frame flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="onb-q-sub">Finishing sign-up…</p>
      <div id="clerk-captcha" />
      {error ? (
        <p className="onb-error" role="alert">
          {error}
        </p>
      ) : null}
      {showManualContinue || error ? (
        <button
          type="button"
          className="onb-btn max-w-sm"
          onClick={() => void goSubscribe()}
        >
          Continue to subscribe
        </button>
      ) : null}
    </div>
  );
}
