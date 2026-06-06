"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { captureEvent } from "@/components/analytics/posthog-provider";
import type { HomepageDemoChallenge } from "@/lib/marketing/demo-challenge";
import {
  LANDING_CHALLENGE_BRUSH,
  LANDING_CHALLENGE_CELL,
  LANDING_CHALLENGE_PCT_SCALE,
  LANDING_CHALLENGE_THRESHOLD,
  landingChallengeFontSize,
} from "@/lib/marketing/landing-trace";

import { MarketingTrialCTAs } from "./marketing-trial-ctas";

type Props = {
  demo: HomepageDemoChallenge;
  trialDays: number;
  initialSignedIn: boolean;
  /** Hide section heading (for `/try`). */
  compactHeading?: boolean;
};

export function LandingChallengeSection({
  demo,
  trialDays,
  initialSignedIn,
  compactHeading = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fontProbeRef = useRef<HTMLSpanElement>(null);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<{
    cols: number;
    rows: number;
    guide: Set<number>;
    total: number;
    covered: Set<number>;
  } | null>(null);
  const drawRef = useRef({ on: false, lastX: 0, lastY: 0 });
  const passedRef = useRef(false);

  const [pct, setPct] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const glyph = demo.arabicText;

  const clearInk = useCallback(() => {
    const c = inkRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    if (maskRef.current) maskRef.current.covered = new Set();
  }, []);

  const setupCanvases = useCallback(() => {
    const wrap = wrapRef.current;
    const guideCanvas = guideRef.current;
    const inkCanvas = inkRef.current;
    if (!wrap || !guideCanvas || !inkCanvas) return;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w < 8 || h < 8) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const fontFamily =
      (fontProbeRef.current &&
        getComputedStyle(fontProbeRef.current).fontFamily) ||
      '"Noto Naskh Arabic", serif';

    for (const c of [guideCanvas, inkCanvas]) {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      const ctx = c.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const g = guideCanvas.getContext("2d");
    if (!g) return;

    g.clearRect(0, 0, w, h);
    const fs = landingChallengeFontSize(w, h);
    g.font = `${fs}px ${fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.direction = "rtl";
    const cy = h / 2 + fs * 0.04;
    g.fillStyle = "rgba(90,212,160,0.16)";
    g.fillText(glyph, w / 2, cy);
    g.lineWidth = 2;
    g.strokeStyle = "rgba(90,212,160,0.34)";
    g.setLineDash([5, 7]);
    g.strokeText(glyph, w / 2, cy);
    g.setLineDash([]);

    const data = g.getImageData(0, 0, guideCanvas.width, guideCanvas.height).data;
    const dpw = guideCanvas.width;
    const cols = Math.ceil(w / LANDING_CHALLENGE_CELL);
    const rows = Math.ceil(h / LANDING_CHALLENGE_CELL);
    const guide = new Set<number>();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = Math.floor((col * LANDING_CHALLENGE_CELL + LANDING_CHALLENGE_CELL / 2) * dpr);
        const py = Math.floor((row * LANDING_CHALLENGE_CELL + LANDING_CHALLENGE_CELL / 2) * dpr);
        const idx = (py * dpw + px) * 4 + 3;
        if (data[idx] > 18) guide.add(row * cols + col);
      }
    }
    maskRef.current = {
      cols,
      rows,
      guide,
      total: guide.size || 1,
      covered: new Set(),
    };
  }, [glyph]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const run = () => setupCanvases();

    run();

    const fontsReady = document.fonts?.ready;
    if (fontsReady) {
      void fontsReady.then(() => requestAnimationFrame(run));
    }

    const resizeObserver = new ResizeObserver(() => run());
    resizeObserver.observe(wrap);

    const onResize = () => {
      run();
      clearInk();
      setPct(0);
      setDone(false);
      setStarted(false);
      passedRef.current = false;
    };
    window.addEventListener("resize", onResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [setupCanvases, clearInk]);

  const stamp = (x: number, y: number) => {
    const m = maskRef.current;
    if (!m) return;
    const r = Math.ceil(LANDING_CHALLENGE_BRUSH / 2 / LANDING_CHALLENGE_CELL);
    const ccx = Math.floor(x / LANDING_CHALLENGE_CELL);
    const ccy = Math.floor(y / LANDING_CHALLENGE_CELL);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const cx = ccx + dx;
        const cy = ccy + dy;
        if (cx < 0 || cy < 0 || cx >= m.cols || cy >= m.rows) continue;
        const key = cy * m.cols + cx;
        if (m.guide.has(key)) m.covered.add(key);
      }
    }
  };

  const updateCoverage = () => {
    const m = maskRef.current;
    if (!m) return;
    const cov = m.covered.size / m.total;
    const nextPct = Math.min(100, Math.round(cov * LANDING_CHALLENGE_PCT_SCALE));
    setPct(nextPct);
    if (cov >= LANDING_CHALLENGE_THRESHOLD && !passedRef.current) {
      passedRef.current = true;
      setDone(true);
      captureEvent("demo_trace_passed", {
        lesson_id: demo.lessonId,
        result: "coverage",
      });
    }
  };

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = inkRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (done) return;
    e.preventDefault();
    setStarted(true);
    const { x, y } = pos(e);
    drawRef.current = { on: true, lastX: x, lastY: y };
    inkRef.current?.setPointerCapture(e.pointerId);
    stamp(x, y);
    updateCoverage();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawRef.current.on || done) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = inkRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#5ad4a0";
    ctx.lineWidth = LANDING_CHALLENGE_BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(drawRef.current.lastX, drawRef.current.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    const steps = Math.max(
      1,
      Math.hypot(x - drawRef.current.lastX, y - drawRef.current.lastY) / 4,
    );
    for (let i = 0; i <= steps; i++) {
      stamp(
        drawRef.current.lastX + ((x - drawRef.current.lastX) * i) / steps,
        drawRef.current.lastY + ((y - drawRef.current.lastY) * i) / steps,
      );
    }
    drawRef.current.lastX = x;
    drawRef.current.lastY = y;
    updateCoverage();
  };

  const endStroke = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (inkRef.current?.hasPointerCapture(e.pointerId)) {
      inkRef.current.releasePointerCapture(e.pointerId);
    }
    drawRef.current.on = false;
  };

  const handleClear = () => {
    clearInk();
    setPct(0);
    setDone(false);
    setStarted(false);
    passedRef.current = false;
  };

  return (
    <section className="mkt-challenge-section" id="challenge">
      <div className="mkt-challenge-inner">
        {!compactHeading ? (
          <>
            <span className="mkt-eyebrow mkt-challenge-eyebrow">
              Try it now — no account
            </span>
            <h2 className="mkt-challenge-h2">Can you write this?</h2>
            <p className="mkt-challenge-sub">{demo.hookLine} Trace the outline — finger, stylus, or mouse.</p>
          </>
        ) : (
          <>
            <span className="mkt-eyebrow mkt-challenge-eyebrow">
              Try it now — no account
            </span>
            <h1 className="mkt-challenge-h2">Can you write this?</h1>
            <p className="mkt-challenge-sub">{demo.hookLine} Trace the outline — finger, stylus, or mouse.</p>
          </>
        )}

        <div className="mkt-challenge-card">
          <div className="mkt-ch-header">
            <div>
              <div className="mkt-ch-label">Challenge · Trace</div>
              <div className="mkt-ch-word" dir="rtl" lang="ar">
                {demo.arabicText}
              </div>
            </div>
            <div className="mkt-ch-translit">{demo.transliteration}</div>
          </div>

          <div className="mkt-canvas-wrap" ref={wrapRef}>
            <span ref={fontProbeRef} className="mkt-font-probe" aria-hidden>
              {glyph}
            </span>
            <canvas ref={guideRef} className="mkt-canvas-el" aria-hidden />
            <canvas
              ref={inkRef}
              className="mkt-canvas-el"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              onPointerLeave={endStroke}
              aria-label={`Trace the Arabic word ${demo.transliteration}`}
            />
            <div className={`mkt-canvas-hint${started ? " hidden" : ""}`}>
              <div className="mkt-pulse-dot" aria-hidden />
              Trace the glowing outline
            </div>
          </div>

          <div className="mkt-ch-footer">
            <button type="button" className="mkt-btn-clear" onClick={handleClear}>
              ↺ Clear
            </button>
            <div className="mkt-ch-bar" aria-hidden>
              <div className="mkt-ch-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="mkt-ch-pct">{pct}%</span>
          </div>
          <p className="mkt-ch-note">
            Trace the faint guide until the bar fills. No sign-up required for this demo.
          </p>
        </div>

        <div className={`mkt-ch-success${done ? " show" : ""}`}>
          <p className="mkt-ch-success-msg">
            ✦ Great stroke! <span>You&apos;re a natural.</span>
          </p>
          <p className="mkt-ch-success-detail">{demo.revealLine}</p>
          <MarketingTrialCTAs
            trialDays={trialDays}
            initialSignedIn={initialSignedIn}
            variant="success"
          />
        </div>
      </div>
    </section>
  );
}
