import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutSuccessAnalytics } from "@/components/analytics/checkout-success";
import { DashboardView } from "@/components/learn/dashboard-view";
import { getDailyChallengeStreakForCurrentUser } from "@/lib/daily-challenge/queries";
import { getDailyChallenge } from "@/lib/marketing/demo-challenge";
import {
  getLearnDashboardStats,
  getLearnDashboardUnitCards,
  getLearnUpNext,
} from "@/lib/learn/dashboard-data";
import {
  completedLessonIdSet,
  fetchUserProgressForCurrentUser,
} from "@/lib/progress/queries";
import { fetchUserSubscriptionForCurrentUser } from "@/lib/subscriptions/queries";
import { isStripeConfigured } from "@/lib/stripe/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PageProps = {
  searchParams: Promise<{ checkout?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkout = params.checkout;

  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);
  const stats = getLearnDashboardStats(completedIds);
  const upNext = getLearnUpNext(completedIds);
  const units = getLearnDashboardUnitCards(completedIds);

  const subscription = await fetchUserSubscriptionForCurrentUser();
  const stripeConfigured = isStripeConfigured();
  const dailyChallenge = getDailyChallenge();
  const dailyStreak = await getDailyChallengeStreakForCurrentUser();

  return (
    <>
      <Suspense fallback={null}>
        <CheckoutSuccessAnalytics />
      </Suspense>

      <DashboardView
        stats={stats}
        upNext={upNext}
        units={units}
        dailyChallenge={dailyChallenge}
        dailyStreak={dailyStreak}
        checkoutSuccess={checkout === "success"}
        stripeConfigured={stripeConfigured}
        subscription={subscription}
      />
    </>
  );
}
