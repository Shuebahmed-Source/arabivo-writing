import { getDailyChallenge } from "@/lib/daily-challenge/get-daily-challenge";
import type { DailyChallenge } from "@/lib/daily-challenge/types";

/** @deprecated Use DailyChallenge from lib/daily-challenge/types */
export type HomepageDemoChallenge = DailyChallenge;

/** Featured on `/`, `/try`, and `/daily` — rotates one word per UTC day. */
export function getHomepageDemoChallenge(): DailyChallenge {
  return getDailyChallenge();
}

export { getDailyChallenge };
