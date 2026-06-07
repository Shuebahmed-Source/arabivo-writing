import Link from "next/link";

import { MarketingAccessCTAs } from "./marketing-access-ctas";
import { PaywallOptions } from "./paywall-options";
import {
  PRICING_SECTION_HEADLINE,
  PRICING_SECTION_SUB,
} from "@/lib/marketing/paywall-copy";

type Props = {
  initialSignedIn: boolean;
};

export function LandingHero({ initialSignedIn }: Props) {
  return (
    <section className="mkt-hero">
      <div className="mkt-hero-copy">
        <span className="mkt-eyebrow">Arabic handwriting practice</span>
        <h1 className="mkt-hero-h1">
          Learn to write Arabic.
          <br />
          <em>One stroke at a time.</em>
        </h1>
        <p className="mkt-hero-sub">
          Calm, guided tracing that builds real muscle memory — letter shapes,
          positions, connections — with clear feedback, not guesswork.
        </p>
        <MarketingAccessCTAs
          initialSignedIn={initialSignedIn}
          variant="hero"
        />
        <p className="mkt-hero-footnote">
          Or{" "}
          <Link href="#challenge">try a challenge free</Link> — no account needed.
          Already subscribed?{" "}
          <Link href="/sign-in?redirect_url=%2Fsubscribe">Sign in</Link>.
        </p>
      </div>

      <div className="mkt-hero-visual">
        <span
          className="mkt-float-ar"
          style={{
            fontSize: "230px",
            top: "-40px",
            right: "-10px",
            transform: "rotate(10deg)",
          }}
          aria-hidden
        >
          ب
        </span>
        <span
          className="mkt-float-ar"
          style={{
            fontSize: "130px",
            bottom: 0,
            left: "-20px",
            transform: "rotate(-8deg)",
          }}
          aria-hidden
        >
          م
        </span>

        <div className="mkt-trace-mock">
          <div className="mkt-mock-header">
            <span className="mkt-mock-tag">Lesson 1 · Trace</span>
            <span className="mkt-mock-translit">salām</span>
          </div>

          <div className="mkt-mock-canvas">
            <span className="mkt-mock-glyph mkt-guide-glyph" aria-hidden>
              سلام
            </span>
            <span className="mkt-mock-glyph mkt-ink-glyph" aria-hidden>
              سلام
            </span>
          </div>

          <div className="mkt-mock-footer">
            <span className="mkt-mock-word" dir="rtl" lang="ar">
              سلام
            </span>
            <div className="mkt-mock-bar-wrap">
              <div className="mkt-mock-bar-fill" />
            </div>
            <span className="mkt-mock-pct">68%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: "✍️",
    title: "Tracing canvas",
    body: "Finger, stylus, and mouse — practice the same stroke on any device, the same way every time.",
  },
  {
    icon: "💬",
    title: "Simple feedback",
    body: "Short evaluations after each trace so you always know when to move on or try again.",
  },
  {
    icon: "📱",
    title: "Mobile first",
    body: "Large touch targets, iPad-optimised for stylus use, and installable as a PWA.",
  },
  {
    icon: "🔤",
    title: "Letters to words",
    body: "Start with isolated letters, then positions, then connections — the natural sequence of Arabic script.",
  },
  {
    icon: "📈",
    title: "Saved progress",
    body: "Every lesson you pass is saved. Pick up exactly where you left off, any time, any device.",
  },
  {
    icon: "🕌",
    title: "Naskh script",
    body: "Practice the clear, classic naskh style — the script used in books, print, and everyday modern Arabic.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="mkt-features-section" id="features">
      <div className="mkt-features-inner">
        <div className="mkt-features-header">
          <span className="mkt-eyebrow">Built for steady progress</span>
          <h2 className="mkt-section-h2">The same rhythm, every lesson.</h2>
          <p className="mkt-section-sub">
            See the script. Trace with guides. Get feedback. Progress saves when
            you pass — no guesswork, no filler.
          </p>
        </div>

        <div className="mkt-features-grid">
          {FEATURES.map((feat) => (
            <article key={feat.title} className="mkt-feat">
              <div className="mkt-feat-icon" aria-hidden>
                {feat.icon}
              </div>
              <h3 className="mkt-feat-title">{feat.title}</h3>
              <p className="mkt-feat-body">{feat.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPricing({ initialSignedIn }: Props) {
  return (
    <section className="mkt-pricing-section" id="pricing">
      <div className="mkt-pricing-inner">
        <span className="mkt-eyebrow">Pricing</span>
        <h2 className="mkt-section-h2">{PRICING_SECTION_HEADLINE}</h2>
        <p className="mkt-section-sub">{PRICING_SECTION_SUB}</p>

        <PaywallOptions variant="landing" initialSignedIn={initialSignedIn} />
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="mkt-footer">
      <span className="mkt-footer-copy">© 2026 ArabivoWrite</span>
      <ul className="mkt-footer-links">
        <li>
          <a href="#">Privacy</a>
        </li>
        <li>
          <a href="#">Terms</a>
        </li>
        <li>
          <a href="#">Contact</a>
        </li>
      </ul>
    </footer>
  );
}
