"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { onboardingTraceFontSize } from "@/lib/onboarding/trace-display";

import { OnboardingSparkles } from "./sparkles";

type Props = {
  glyph?: string;
  translit?: string;
  meaning?: string;
  tag?: string;
  title?: string;
  sub?: string;
  /** Demo exercises: always allow Continue (tracing is optional). */
  allowAdvanceWithoutTrace?: boolean;
  continueLabel?: string;
  busy?: boolean;
  onDone: () => void;
};

const CELL = 12;
const BRUSH = 22;

export function OnboardingTraceStep({
  glyph = "س",
  translit = "sīn",
  meaning = "the letter sīn",
  tag = "FIRST TRACE",
  title = "Now — trace your first letter ✍️",
  sub = "Follow the glowing outline below. Finger, stylus or mouse — whatever you've got.",
  allowAdvanceWithoutTrace = false,
  continueLabel: continueLabelProp,
  busy = false,
  onDone,
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
  const [coverage, setCoverage] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

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
    const fs = onboardingTraceFontSize(w, h, glyph);
    g.font = `${fs}px ${fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.direction = "rtl";
    const cy = h / 2 + fs * 0.04;
    g.fillStyle = "rgba(14,122,75,0.18)";
    g.fillText(glyph, w / 2, cy);
    g.lineWidth = 2.5;
    g.strokeStyle = "rgba(14,122,75,0.42)";
    g.setLineDash([5, 7]);
    g.strokeText(glyph, w / 2, cy);
    g.setLineDash([]);

    const data = g.getImageData(0, 0, guideCanvas.width, guideCanvas.height).data;
    const dpw = guideCanvas.width;
    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    const guide = new Set<number>();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = Math.floor((col * CELL + CELL / 2) * dpr);
        const py = Math.floor((row * CELL + CELL / 2) * dpr);
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

    const run = () => {
      setupCanvases();
    };

    run();

    const fontsReady = document.fonts?.ready;
    if (fontsReady) {
      void fontsReady.then(() => requestAnimationFrame(run));
    }

    const resizeObserver = new ResizeObserver(() => {
      run();
    });
    resizeObserver.observe(wrap);

    const onResize = () => {
      run();
      clearInk();
      setCoverage(0);
      setDone(false);
      setStarted(false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [setupCanvases, clearInk]);

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = inkRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const stamp = (x: number, y: number) => {
    const m = maskRef.current;
    if (!m) return;
    const r = Math.ceil(BRUSH / 2 / CELL);
    const ccx = Math.floor(x / CELL);
    const ccy = Math.floor(y / CELL);
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

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setStarted(true);
    const { x, y } = pos(e);
    drawRef.current = { on: true, lastX: x, lastY: y };
    inkRef.current?.setPointerCapture(e.pointerId);
    stamp(x, y);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawRef.current.on) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = inkRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0E7A4B";
    ctx.lineWidth = BRUSH;
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

    const m = maskRef.current;
    const cov = m ? m.covered.size / m.total : 0;
    setCoverage(cov);
    if (cov >= 0.5 && !done) {
      setDone(true);
    }
  };

  const endStroke = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (inkRef.current?.hasPointerCapture(e.pointerId)) {
      inkRef.current.releasePointerCapture(e.pointerId);
    }
    drawRef.current.on = false;
  };

  const pct = Math.min(100, Math.round(coverage * 175));

  const handleClear = () => {
    clearInk();
    setCoverage(0);
    setDone(false);
    setStarted(false);
  };

  const continueLabel =
    continueLabelProp ??
    (done
      ? "Beautiful — keep going"
      : allowAdvanceWithoutTrace || started
        ? "Continue"
        : "Trace to continue");

  const canAdvance =
    allowAdvanceWithoutTrace || started || done;

  return (
    <>
      <div className="onb-step onb-trace-step">
        <h1 className="onb-q-title">{title}</h1>
        <p className="onb-q-sub">{sub}</p>

        <div className="onb-trace-card">
          <div className="onb-trace-meta">
            <span className="onb-trace-tag">{tag}</span>
            <span className="onb-trace-translit">{translit}</span>
          </div>

          <div className="onb-trace-canvas-wrap" ref={wrapRef}>
            <span
              ref={fontProbeRef}
              className="onb-trace-font-probe"
              aria-hidden
            >
              {glyph}
            </span>
            <canvas ref={guideRef} className="onb-trace-canvas onb-guide" aria-hidden />
            <canvas
              ref={inkRef}
              className="onb-trace-canvas onb-ink"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              onPointerLeave={endStroke}
              aria-label="Trace the Arabic guide"
            />

            {!started && !done ? (
              <div className="onb-trace-hint">
                <span className="onb-trace-hint-dot" aria-hidden />
                Start here & trace the glow
              </div>
            ) : null}

            <OnboardingSparkles show={done} />
            {done ? (
              <div className="onb-trace-done-badge">
                <span aria-hidden>🎉</span> You wrote {meaning}!
              </div>
            ) : null}
          </div>

          <div className="onb-trace-footer">
            <button type="button" className="onb-trace-clear" onClick={handleClear}>
              ↺ Clear
            </button>
            <div className="onb-trace-bar" aria-hidden>
              <span style={{ width: `${pct}%` }} />
            </div>
            <span className="onb-trace-pct">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="onb-cta-dock">
        <button
          type="button"
          className="onb-btn"
          disabled={busy || !canAdvance}
          onClick={() => {
            if (busy) return;
            onDone();
          }}
        >
          {continueLabel}
        </button>
      </div>
    </>
  );
}
