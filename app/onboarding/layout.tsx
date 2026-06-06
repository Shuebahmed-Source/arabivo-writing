import { Fredoka, Hanken_Grotesk, Noto_Naskh_Arabic } from "next/font/google";

import "@/components/onboarding/onboarding.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-onb-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-onb-body",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-onb-arabic",
  display: "swap",
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`onboarding-root ${fredoka.variable} ${hanken.variable} ${notoNaskh.variable}`}
    >
      {children}
    </div>
  );
}
