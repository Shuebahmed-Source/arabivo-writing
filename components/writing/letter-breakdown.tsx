import { ArrowDown } from "lucide-react";
import type { LessonType } from "@/lib/lessons";

// Strip diacritics and tatweel so we show bare letter shapes
function isolatedLetters(text: string): string[] {
  return Array.from(text).filter(
    (ch) => !/[ً-ٰٟـ]/.test(ch) && ch.trim() !== "",
  );
}

type Props = {
  arabicText: string;
  type: LessonType;
};

export function LetterBreakdown({ arabicText, type }: Props) {
  if (type === "isolated_letter" || type === "letter_form") return null;

  const letters = isolatedLetters(arabicText);
  if (letters.length <= 1) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-5 py-4">
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
        Letter breakdown
      </p>

      {/* Isolated letters — each in its own span so shaping engine treats them as isolated */}
      <div
        className="flex flex-row-reverse items-center gap-1"
        dir="rtl"
        lang="ar"
        aria-label="Individual letters"
      >
        {letters.map((letter, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="font-arabic text-3xl leading-none text-foreground">
              {letter}
            </span>
            {i < letters.length - 1 && (
              <span
                className="font-sans text-lg text-muted-foreground/50"
                aria-hidden
              >
                ·
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Arrow */}
      <div className="my-3 flex justify-center">
        <ArrowDown className="size-4 text-primary" aria-hidden />
      </div>

      {/* Connected word */}
      <div className="flex justify-center">
        <span
          className="font-arabic text-4xl leading-none text-foreground"
          dir="rtl"
          lang="ar"
          aria-label="Connected word"
        >
          {arabicText}
        </span>
      </div>
    </div>
  );
}
