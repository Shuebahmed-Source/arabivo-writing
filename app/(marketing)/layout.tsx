import { auth } from "@clerk/nextjs/server";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trialDays = getStripeTrialPeriodDays();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <MarketingHeader
        trialDays={trialDays}
        initialSignedIn={initialSignedIn}
      />
      {children}
    </div>
  );
}
