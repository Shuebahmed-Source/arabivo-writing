import Link from "next/link";

import type {
  LearnDashboardStats,
  LearnDashboardUnitCard,
  LearnUpNext,
} from "@/lib/learn/dashboard-data";
import type { UserSubscriptionRow } from "@/lib/subscriptions/types";

import { LearnProgressRing } from "./progress-ring";
import { LearnSubscriptionCard } from "./subscription-card";

type Props = {
  stats: LearnDashboardStats;
  upNext: LearnUpNext | null;
  units: LearnDashboardUnitCard[];
  checkoutSuccess?: boolean;
  stripeConfigured: boolean;
  subscription: UserSubscriptionRow | null;
};

function StatusBadge({
  locked,
  inProgress,
}: {
  locked: boolean;
  inProgress: boolean;
}) {
  if (locked) {
    return <span className="learn-status-badge locked">Locked</span>;
  }
  if (inProgress) {
    return <span className="learn-status-badge progress">In progress</span>;
  }
  return <span className="learn-status-badge complete">✓ Complete</span>;
}

function UnitCard({
  unit,
  index,
}: {
  unit: LearnDashboardUnitCard;
  index: number;
}) {
  const content = (
    <>
      <span className="learn-sc-deco" aria-hidden>
        {unit.arabicDeco}
      </span>
      <div className="learn-sc-top">
        <span className="learn-sc-title">{unit.title}</span>
        <StatusBadge locked={unit.locked} inProgress={unit.inProgress} />
      </div>
      <p className="learn-sc-desc">{unit.description}</p>
      <div className="learn-sc-progress">
        <LearnProgressRing
          pct={unit.pct}
          accent={unit.inProgress}
          delayMs={index * 100}
          label={`${unit.title} ${unit.pct}%`}
        />
        <div className="learn-sc-count">
          <span className="learn-sc-count-val">
            {unit.completedCount} / {unit.lessonCount}
          </span>
          <span className="learn-sc-count-label">lessons</span>
        </div>
      </div>
    </>
  );

  if (unit.href) {
    return (
      <Link
        href={unit.href}
        className={`learn-sc${unit.inProgress ? " active" : ""}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`learn-sc locked${unit.inProgress ? " active" : ""}`}>
      {content}
    </div>
  );
}

export function DashboardView({
  stats,
  upNext,
  units,
  checkoutSuccess = false,
  stripeConfigured,
  subscription,
}: Props) {
  return (
    <div className="learn-main-dashboard">
      {checkoutSuccess ? (
        <p className="learn-banner" role="status">
          Thanks — your subscription is updating. If status does not refresh
          within a minute, reload this page.
        </p>
      ) : null}

      <LearnSubscriptionCard
        stripeConfigured={stripeConfigured}
        subscription={subscription}
      />

      <header>
        <h1 className="learn-page-title">Your learning path</h1>
        <p className="learn-page-sub">
          Complete lessons in order — Good or Excellent on Check. Your place is
          stored per signed-in account.
        </p>
      </header>

      <div className="learn-stats-row">
        <div className="learn-stat-chip">
          <span className="learn-stat-value accent">
            {stats.overallPct}
            <span className="learn-stat-suffix">%</span>
          </span>
          <span className="learn-stat-label">Overall progress</span>
        </div>
        <div className="learn-stat-chip">
          <span className="learn-stat-value">
            {stats.lessonsDone}
            <span className="learn-stat-suffix"> / {stats.lessonsTotal}</span>
          </span>
          <span className="learn-stat-label">Lessons complete</span>
        </div>
        <div className="learn-stat-chip">
          <span className="learn-stat-value">
            {stats.sectionsDone}
            <span className="learn-stat-suffix"> / {stats.sectionsTotal}</span>
          </span>
          <span className="learn-stat-label">Sections done</span>
        </div>
      </div>

      {upNext ? (
        <Link href={upNext.href} className="learn-continue-card">
          <span className="learn-continue-deco" aria-hidden>
            {upNext.arabicDeco}
          </span>
          <div className="learn-continue-body">
            <span className="learn-continue-eyebrow">Up next</span>
            <span className="learn-continue-title">{upNext.title}</span>
            <p className="learn-continue-desc">{upNext.description}</p>
            <div className="learn-continue-progress">
              <span className="learn-continue-count">
                {upNext.done} of {upNext.total} lessons
              </span>
              <div className="learn-continue-bar">
                <span
                  style={{
                    width: `${upNext.total > 0 ? Math.round((upNext.done / upNext.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="learn-continue-action">
            <span className="learn-btn-go">Continue →</span>
          </div>
        </Link>
      ) : null}

      <div className="learn-sections-group">
        <div className="learn-sections-header">
          <span className="learn-sections-title">All sections</span>
          <Link href="/lessons" className="learn-section-view-link">
            View all lessons →
          </Link>
        </div>
        <div className="learn-sections-grid">
          {units.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
