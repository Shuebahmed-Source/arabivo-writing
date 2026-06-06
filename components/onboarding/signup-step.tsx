"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { markDemoCompleted, saveOnboardingProfile } from "@/app/actions/onboarding";
import { clearOnboardingSession, mergeOnboardingSession } from "@/lib/onboarding/session";
import type { OnboardingAnswers } from "@/lib/onboarding/types";

type Props = {
  answers: OnboardingAnswers;
  firstTraceCompleted: boolean;
};

export function OnboardingSignupStep({ answers, firstTraceCompleted }: Props) {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [form, setForm] = useState({ name: "", email: "", pass: "" });
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = fetchStatus === "fetching";

  const valid =
    form.name.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.pass.length >= 6;

  const persistSession = () => {
    mergeOnboardingSession({ answers, firstTraceCompleted });
  };

  const persistAndGoSubscribe = async () => {
    persistSession();
    const res = await saveOnboardingProfile(answers, firstTraceCompleted);
    if (!res.ok) {
      throw new Error(res.message);
    }
    await markDemoCompleted();
    clearOnboardingSession();
    router.push("/subscribe");
    router.refresh();
  };

  const finalizeToSubscribe = async () => {
    await signUp.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.warn("[onboarding] session task pending", session.currentTask);
          return;
        }
        try {
          await persistAndGoSubscribe();
        } catch (err) {
          const url = decorateUrl("/subscribe");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push("/subscribe");
          }
          if (err instanceof Error) setError(err.message);
        }
      },
    });
  };

  const onGoogle = async () => {
    persistSession();
    setError(null);
    const { error: ssoError } = await signUp.sso({
      strategy: "oauth_google",
      redirectCallbackUrl: "/onboarding/sso-callback",
      redirectUrl: "/subscribe",
    });
    if (ssoError) {
      setError("Could not start Google sign-up. Try email instead.");
    }
  };

  const onEmailSubmit = async () => {
    setError(null);
    const { error: passwordError } = await signUp.password({
      emailAddress: form.email,
      password: form.pass,
    });
    if (passwordError) {
      setError(
        errors.fields.emailAddress?.message ??
          errors.fields.password?.message ??
          "Could not create account.",
      );
      return;
    }

    if (signUp.missingFields?.includes("first_name")) {
      await signUp.update({ firstName: form.name.trim() });
    }

    if (signUp.status === "complete") {
      await finalizeToSubscribe();
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setError("Could not send verification code.");
      return;
    }
    setPendingVerification(true);
  };

  const onVerify = async () => {
    setError(null);
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code,
    });
    if (verifyError) {
      setError(errors.fields.code?.message ?? "Invalid verification code.");
      return;
    }

    if (signUp.status === "complete") {
      await finalizeToSubscribe();
      return;
    }

    setError("Verification incomplete. Try again.");
  };

  const setField =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const displayError =
    error ??
    errors.fields.emailAddress?.message ??
    errors.fields.password?.message ??
    errors.fields.code?.message;

  return (
    <>
      <div className="onb-step">
        <h1 className="onb-q-title" style={{ marginTop: 22 }}>
          Save your progress 🔒
        </h1>
        <p className="onb-q-sub">
          Create a free account so your plan and tracing progress are always here.
        </p>

        {pendingVerification ? (
          <div className="onb-signup-form">
            <div className="onb-field">
              <label htmlFor="onb-verify-code">Verification code</label>
              <input
                id="onb-verify-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the code from your email"
                autoComplete="one-time-code"
              />
            </div>
            {displayError ? (
              <p className="onb-error" role="alert">
                {displayError}
              </p>
            ) : null}
            <div className="onb-cta-dock onb-cta-dock-inline">
              <button
                type="button"
                className="onb-btn"
                disabled={!code.trim() || loading}
                onClick={onVerify}
              >
                {loading ? "Verifying…" : "Verify email"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="onb-social-row">
              <button
                type="button"
                className="onb-social-btn"
                disabled={loading}
                onClick={onGoogle}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.5 3.2-4.4 6-4.4z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="onb-divider">or sign up with email</div>

            <div className="onb-signup-form">
              <div className="onb-field">
                <label htmlFor="onb-name">Name</label>
                <input
                  id="onb-name"
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div className="onb-field">
                <label htmlFor="onb-email">Email</label>
                <input
                  id="onb-email"
                  type="email"
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="onb-field">
                <label htmlFor="onb-pass">Password</label>
                <input
                  id="onb-pass"
                  type="password"
                  value={form.pass}
                  onChange={setField("pass")}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {displayError ? (
              <p className="onb-error" role="alert">
                {displayError}
              </p>
            ) : null}

            <p className="onb-fineprint">
              By continuing you agree to our Terms & Privacy Policy.
            </p>

            <div id="clerk-captcha" />

            <div className="onb-cta-dock">
              <button
                type="button"
                className="onb-btn"
                disabled={!valid || loading}
                onClick={onEmailSubmit}
              >
                {loading ? "Creating account…" : "Start my first session"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
