import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";

import { LandingChallengeSection } from "@/components/marketing/landing-challenge-section";
import { getHomepageDemoChallenge } from "@/lib/marketing/demo-challenge";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";

export const metadata: Metadata = {
  title: "Try a challenge word",
  description:
    "Trace قلم — the Arabic word for pen. Free handwriting demo, no account needed.",
};

export default async function TryPage() {
  const demo = getHomepageDemoChallenge();
  const trialDays = getStripeTrialPeriodDays();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);

  return (
    <div className="mkt-try-page">
      <Link href="/" className="mkt-try-back">
        ← Home
      </Link>

      <LandingChallengeSection
        demo={demo}
        trialDays={trialDays}
        initialSignedIn={initialSignedIn}
        compactHeading
      />
    </div>
  );
}
