import type { LucideIcon } from "lucide-react";
import {
  Award,
  Gem,
  Heart,
  Moon,
  Sparkles,
  Star,
  Sun,
  Zap,
} from "lucide-react";

/** Rotates by lesson id so each item gets a consistent “badge” icon on the complete screen. */
const COMPLETION_ICONS: LucideIcon[] = [
  Sparkles,
  Star,
  Award,
  Gem,
  Heart,
  Zap,
  Sun,
  Moon,
];

export function getCompletionIconForLesson(lessonId: string): LucideIcon {
  let h = 0;
  for (let i = 0; i < lessonId.length; i++) {
    h = (h + lessonId.charCodeAt(i) * (i + 1)) % 1_000_000_007;
  }
  return COMPLETION_ICONS[Math.abs(h) % COMPLETION_ICONS.length];
}

/** Subtle tint behind the badge icon — varies with lesson for a bit of variety. */
export function getCompletionBadgeTintClass(lessonId: string): string {
  const tints = [
    "bg-primary/15 text-primary",
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    "bg-lime-500/12 text-lime-800 dark:text-lime-400",
    "bg-cyan-500/12 text-cyan-800 dark:text-cyan-400",
  ];
  let h = 0;
  for (let i = 0; i < lessonId.length; i++) {
    h = (h + lessonId.charCodeAt(i)) % 997;
  }
  return tints[Math.abs(h) % tints.length];
}
