import { Fredoka, Hanken_Grotesk, Noto_Naskh_Arabic } from "next/font/google";

import { LearnHeader } from "@/components/layout/learn-header";
import "@/components/learn/learn.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-learn-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-learn-body",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-learn-arabic",
  display: "swap",
});

export const dynamic = "force-dynamic";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`learn-root ${fredoka.variable} ${hanken.variable} ${notoNaskh.variable}`}
    >
      <LearnHeader />
      {children}
    </div>
  );
}
