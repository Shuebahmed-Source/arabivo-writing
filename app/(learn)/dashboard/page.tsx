import type { Metadata } from "next";

import { LearningUnitsGrid } from "@/components/dashboard/learning-units-grid";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { getDashboardUnits } from "@/lib/progress/dashboard-units";
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
  searchParams: Promise<{ checkout?: string; subscribe?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkout = params.checkout;
  const subscribe = params.subscribe;

  const rows = await fetchUserProgressForCurrentUser();
  const completedIds = completedLessonIdSet(rows);
  const units = getDashboardUnits(completedIds);

  const subscription = await fetchUserSubscriptionForCurrentUser();
  const stripeConfigured = isStripeConfigured();

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your learning path
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Complete lessons in order (Good or Excellent on Check). Your place is
          stored per signed-in account.
        </p>
      </header>

      {checkout === "success" ? (
        <p
          className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          Thanks — your subscription is updating. If status does not refresh
          within a minute, reload this page.
        </p>
      ) : null}
      {checkout === "canceled" ? (
        <p
          className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          Checkout was canceled. You can subscribe anytime from below.
        </p>
      ) : null}
      {subscribe === "required" && stripeConfigured ? (
        <p
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          Lessons are included with your subscription. Start checkout below (includes
          any free trial if enabled). After you subscribe, open Lessons again.
        </p>
      ) : null}

      <SubscriptionCard
        stripeConfigured={stripeConfigured}
        subscription={subscription}
      />

      <LearningUnitsGrid units={units} />
    </div>
  );
}
