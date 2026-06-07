import { Fredoka, Hanken_Grotesk, Noto_Naskh_Arabic } from "next/font/google";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";

import { MarketingHeader } from "@/components/layout/marketing-header";
import "@/components/marketing/marketing.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-mkt-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-mkt-body",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-mkt-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://write.arabivo.net"),
  title: "ArabivoWrite — Learn Arabic by Writing",
  description:
    "Calm, guided Arabic handwriting practice — trace letter shapes, positions, and words with clear feedback.",
  openGraph: {
    title: "ArabivoWrite — Learn Arabic by Writing",
    description:
      "Calm, guided Arabic handwriting practice — trace letter shapes, positions, and words with clear feedback.",
    url: "https://write.arabivo.net",
    siteName: "ArabivoWrite",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "ArabivoWrite preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArabivoWrite — Learn Arabic by Writing",
    description:
      "Calm, guided Arabic handwriting practice — trace letter shapes, positions, and words with clear feedback.",
    images: ["/preview.png"],
  },
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);

  return (
    <div
      className={`marketing-root ${fredoka.variable} ${hanken.variable} ${notoNaskh.variable}`}
    >
      <MarketingHeader initialSignedIn={initialSignedIn} />
      {children}
    </div>
  );
}
