import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";

import { LandingChallengeSection } from "@/components/marketing/landing-challenge-section";
import { getDailyChallengeStreakForCurrentUser } from "@/lib/daily-challenge/queries";
import { getDailyChallenge } from "@/lib/marketing/demo-challenge";

export const metadata: Metadata = {
  title: "Try a challenge word",
  description:
    "Trace today’s Arabic word of the day. Free handwriting demo — no account needed.",
};

export default async function TryPage() {
  const challenge = getDailyChallenge();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);
  const streak = initialSignedIn
    ? await getDailyChallengeStreakForCurrentUser()
    : null;

  return (
    <div className="mkt-try-page">
      <Link href="/" className="mkt-try-back">
        ← Home
      </Link>

      <LandingChallengeSection
        challenge={challenge}
        initialSignedIn={initialSignedIn}
        streak={streak}
        compactHeading
      />
    </div>
  );
}
