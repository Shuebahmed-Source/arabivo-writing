import Link from "next/link";

import type { DailyChallenge } from "@/lib/daily-challenge/types";
import type { DailyChallengeStreak } from "@/lib/daily-challenge/types";

type Props = {
  challenge: DailyChallenge;
  streak: DailyChallengeStreak | null;
};

export function DashboardDailyChallengeCard({ challenge, streak }: Props) {
  const streakCount = streak?.currentStreak ?? 0;
  const completedToday = streak?.completedToday ?? false;

  return (
    <Link href="/daily" className="learn-daily-card">
      <div className="learn-daily-card-top">
        <span className="learn-daily-eyebrow">Daily challenge</span>
        {streakCount > 0 ? (
          <span className="learn-daily-streak-badge">
            🔥 {streakCount}-day{streakCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      <div className="learn-daily-word-row">
        <span className="learn-daily-arabic" dir="rtl" lang="ar">
          {challenge.arabicText}
        </span>
        <span className="learn-daily-meta">
          <span className="learn-daily-translit">{challenge.transliteration}</span>
          <span className="learn-daily-status">
            {completedToday ? "Completed today" : "Trace today’s word →"}
          </span>
        </span>
      </div>
    </Link>
  );
}
