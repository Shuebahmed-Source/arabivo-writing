import Link from "next/link";

import type { Lesson } from "@/lib/lessons";
import { referenceArabicFontSize } from "@/lib/writing/lesson-display";

export type SectionHubLesson = {
  lesson: Lesson;
  unlocked: boolean;
  done: boolean;
  href: string | null;
};

type Props = {
  unitTitle: string;
  sectionTitle: string;
  sectionDescription: string;
  continueHref: string | null;
  nextSectionHref: string | null;
  allDone: boolean;
  hasNextSection: boolean;
  lessons: SectionHubLesson[];
};

function LessonBadge({
  unlocked,
  done,
}: {
  unlocked: boolean;
  done: boolean;
}) {
  if (!unlocked) {
    return <span className="learn-lesson-badge locked">Locked</span>;
  }
  if (done) {
    return <span className="learn-lesson-badge done">✓ Done</span>;
  }
  return <span className="learn-lesson-badge available">Tap to start</span>;
}

function LessonRow({ item }: { item: SectionHubLesson }) {
  const { lesson, unlocked, done, href } = item;
  const rowClass = `learn-lesson-row${done ? " done" : ""}${!unlocked ? " locked" : ""}`;
  const arSize = referenceArabicFontSize(lesson.arabicText);

  const body = (
    <>
      <div className="learn-lesson-row-top">
        <div className="learn-lesson-row-ar-wrap">
          <p
            className="learn-lesson-row-ar"
            style={{ fontSize: `${arSize}px` }}
            dir="rtl"
            lang="ar"
          >
            {lesson.arabicText}
          </p>
        </div>
        <div className="learn-lesson-row-meta">
          <LessonBadge unlocked={unlocked} done={done} />
          {unlocked ? (
            <span className="learn-lesson-row-chevron" aria-hidden>
              ›
            </span>
          ) : null}
        </div>
      </div>
      <p className="learn-lesson-row-title">{lesson.title}</p>
      <p className="learn-lesson-row-desc">{lesson.englishMeaning}</p>
      {unlocked && !done ? (
        <p className="learn-lesson-row-hint">Trace this on the canvas →</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={rowClass}
        aria-label={`Start lesson: ${lesson.transliteration}, ${lesson.arabicText}`}
      >
        {body}
      </Link>
    );
  }

  return (
    <div className={rowClass} title="Complete the previous item to unlock">
      {body}
    </div>
  );
}

export function SectionHubView({
  unitTitle,
  sectionTitle,
  sectionDescription,
  continueHref,
  nextSectionHref,
  allDone,
  hasNextSection,
  lessons,
}: Props) {
  return (
    <div className="learn-main-section">
      <Link href="/lessons" className="learn-back-link">
        ← All lessons
      </Link>

      <header className="learn-section-hub-header">
        <span className="learn-section-hub-unit">{unitTitle}</span>
        <h1 className="learn-page-title">{sectionTitle}</h1>
        <p className="learn-page-sub">{sectionDescription}</p>
      </header>

      <div className="learn-section-hub-actions">
        {continueHref ? (
          <Link href={continueHref} className="learn-btn-primary">
            Continue →
          </Link>
        ) : null}
        {allDone && hasNextSection && nextSectionHref ? (
          <Link href={nextSectionHref} className="learn-btn-outline">
            Next section →
          </Link>
        ) : null}
        {allDone && !hasNextSection ? (
          <Link href="/lessons" className="learn-btn-outline">
            Back to lessons
          </Link>
        ) : null}
      </div>

      <ul className="learn-lesson-list">
        {lessons.map((item) => (
          <li key={item.lesson.id}>
            <LessonRow item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
