import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";

export const metadata: Metadata = {
  metadataBase: new URL("https://write.arabivo.net"),
  title: "Arabivo Write — Learn Arabic by Tracing",
  description:
    "Build Arabic writing muscle memory by tracing real Arabic words and phrases.",
  openGraph: {
    title: "Arabivo Write — Learn Arabic by Tracing",
    description:
      "Build Arabic writing muscle memory by tracing real Arabic words and phrases.",
    url: "https://write.arabivo.net",
    siteName: "Arabivo Write",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Arabivo Write preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arabivo Write — Learn Arabic by Tracing",
    description:
      "Build Arabic writing muscle memory by tracing real Arabic words and phrases.",
    images: ["/preview.png"],
  },
};

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
