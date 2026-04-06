import { MarketingHeader } from "@/components/layout/marketing-header";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trialDays = getStripeTrialPeriodDays();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <MarketingHeader trialDays={trialDays} />
      {children}
    </div>
  );
}
