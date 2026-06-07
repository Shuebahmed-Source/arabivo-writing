import Link from "next/link";

import type { LearnUnitBlock } from "@/lib/learn/lessons-data";
import type { LearnLessonStatus } from "@/lib/learn/lesson-status";

type Props = {
  blocks: LearnUnitBlock[];
};

function LessonBadge({
  status,
  unlocked,
}: {
  status: LearnLessonStatus;
  unlocked: boolean;
}) {
  if (!unlocked) {
    return <span className="learn-lesson-badge locked">Locked</span>;
  }
  if (status === "done") {
    return <span className="learn-lesson-badge done">✓ Done</span>;
  }
  if (status === "progress") {
    return <span className="learn-lesson-badge progress">In progress</span>;
  }
  return <span className="learn-lesson-badge available">Available</span>;
}

function ProgressDots({ done, total }: { done: number; total: number }) {
  return (
    <div className="learn-dots" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`learn-dot ${i < done ? "done" : "pending"}`}
        />
      ))}
    </div>
  );
}

function countLabel(status: LearnLessonStatus, done: number, total: number) {
  if (status === "done") {
    return { text: `${total} lessons`, className: "done" as const };
  }
  return {
    text: `${done} / ${total}`,
    className: (status === "progress" ? "progress" : "available") as
      | "progress"
      | "available",
  };
}

function SectionCard({
  section,
}: {
  section: LearnUnitBlock["sections"][number];
}) {
  const cardClass = `learn-lc${section.status === "done" ? " done" : ""}${section.status === "progress" ? " progress" : ""}${!section.unlocked ? " locked" : ""}`;
  const count = countLabel(section.status, section.done, section.total);

  const body = (
    <>
      <div className="learn-lc-top">
        <span className="learn-lc-title">{section.title}</span>
        <div className="learn-lc-meta">
          <LessonBadge status={section.status} unlocked={section.unlocked} />
          {section.unlocked ? (
            <span className="learn-lc-chevron" aria-hidden>
              ›
            </span>
          ) : null}
        </div>
      </div>
      <p className="learn-lc-desc">{section.description}</p>
      <div className="learn-lc-dots-row">
        <ProgressDots done={section.done} total={section.total} />
        <span className={`learn-lc-count ${count.className}`}>{count.text}</span>
      </div>
    </>
  );

  if (section.href) {
    return (
      <Link href={section.href} className={cardClass}>
        {body}
      </Link>
    );
  }

  return (
    <div className={cardClass} title="Complete the previous section to unlock">
      {body}
    </div>
  );
}

function UnitBlock({ block }: { block: LearnUnitBlock }) {
  const decoClass = block.allDone ? "complete" : "progress";

  return (
    <section className="learn-unit-block" id={block.id}>
      <div className="learn-unit-header">
        <span
          className={`learn-unit-deco ${decoClass}`}
          aria-hidden
          dir="rtl"
          lang="ar"
        >
          {block.arabicDeco}
        </span>
        <div className="learn-unit-header-row">
          <div className="learn-unit-header-copy">
            <h2 className="learn-unit-title">{block.title}</h2>
            <p className="learn-unit-desc">{block.description}</p>
          </div>
          <span
            className={`learn-unit-badge ${block.allDone ? "complete" : "progress"}`}
          >
            {block.allDone ? "✓ Complete" : `${block.done} / ${block.total}`}
          </span>
        </div>
      </div>

      <div className="learn-lesson-grid">
        {block.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

export function LessonsView({ blocks }: Props) {
  return (
    <div className="learn-main-lessons">
      <header>
        <h1 className="learn-page-title">Lessons</h1>
        <p className="learn-page-sub">
          Open a section, then work through letters in order. After{" "}
          <strong>Good</strong> or <strong>Excellent</strong>, you move to the
          next item automatically. Finish every item in a section to unlock the
          next section.
        </p>
      </header>

      {blocks.map((block) => (
        <UnitBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
