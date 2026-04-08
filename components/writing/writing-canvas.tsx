"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

import { type TraceScoreResult, scoreUserTrace } from "./score-user-trace";

export type WritingCanvasHandle = {
  clear: () => void;
  check: () => TraceScoreResult;
};

export type { TraceScoreResult };

type WritingCanvasProps = {
  /** Arabic text shown faintly as a tracing guide */
  guideText: string;
  className?: string;
};

type Point = { x: number; y: number };

/** Normalized 0–1 coords so ink survives resize and stays aligned with the guide. */
type NormPoint = { nx: number; ny: number };

type InkCommand =
  | { kind: "segment"; from: NormPoint; to: NormPoint }
  | { kind: "quad"; from: NormPoint; ctrl: NormPoint; to: NormPoint }
  | { kind: "dot"; p: NormPoint };

/** Logical CSS px under the dpr transform — bold ink similar to reference tracing apps (~10–12px). */
const INK_LINE_WIDTH_PX = 11;
/** Wider than visible ink so pixel scoring tolerates small drift from the guide. */
const MASK_LINE_WIDTH_PX = 22;
/** Match round line caps so dots read like pen blobs, not pinpoints. */
const INK_DOT_RADIUS_PX = INK_LINE_WIDTH_PX / 2;
const MASK_DOT_RADIUS_PX = MASK_LINE_WIDTH_PX / 2;

function toNorm(p: Point, w: number, h: number): NormPoint {
  if (w < 1 || h < 1) return { nx: 0, ny: 0 };
  return { nx: p.x / w, ny: p.y / h };
}

function toCss(np: NormPoint, w: number, h: number): Point {
  return { x: np.nx * w, y: np.ny * h };
}

function getOffsetCoords(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function ensureMaskElements(
  guideRef: React.MutableRefObject<HTMLCanvasElement | null>,
  userRef: React.MutableRefObject<HTMLCanvasElement | null>,
): boolean {
  if (typeof document === "undefined") return false;
  if (!guideRef.current) {
    guideRef.current = document.createElement("canvas");
    userRef.current = document.createElement("canvas");
  }
  return true;
}

function renderGuideMask(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
  dpr: number,
  text: string,
  fontFamily: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(cssW, cssH) * 0.42;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.direction = "rtl";
  const cx = cssW / 2;
  const cy = cssH / 2;
  ctx.fillText(text, cx, cy);
}

function clearUserMaskCanvas(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
  dpr: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cssW, cssH);
}

export const WritingCanvas = forwardRef<WritingCanvasHandle, WritingCanvasProps>(
  function WritingCanvas({ guideText, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const guideMaskRef = useRef<HTMLCanvasElement | null>(null);
    const userMaskRef = useRef<HTMLCanvasElement | null>(null);
    const fontProbeRef = useRef<HTMLSpanElement>(null);
    const drawingRef = useRef(false);
    /** Previous raw pointer position for the current stroke. */
    const strokeRawRef = useRef<Point | null>(null);
    /** Last drawn curve endpoint (midpoint between successive samples) for quadratic smoothing. */
    const strokeMidRef = useRef<Point | null>(null);
    const dprRef = useRef(1);
    const cssSizeRef = useRef({ w: 0, h: 0 });
    const inkCommandsRef = useRef<InkCommand[]>([]);

    const getFontFamily = useCallback(() => {
      const probe = fontProbeRef.current;
      return (
        (probe && getComputedStyle(probe).fontFamily) ||
        "Noto Sans Arabic, sans-serif"
      );
    }, []);

    const drawGuide = useCallback(() => {
      const canvas = canvasRef.current;
      const probe = fontProbeRef.current;
      if (!canvas || !probe) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = cssSizeRef.current;
      if (w < 8 || h < 8) return;

      const fontFamily = getFontFamily();
      const fontSize = Math.min(w, h) * 0.42;

      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = "oklch(0.52 0.14 163)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.direction = "rtl";
      ctx.fillText(guideText, w / 2, h / 2);
      ctx.restore();
    }, [guideText, getFontFamily]);

    const redrawVisibleBase = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = cssSizeRef.current;
      const dpr = dprRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "oklch(0.99 0.01 163 / 0.35)";
      ctx.fillRect(0, 0, w, h);

      drawGuide();
    }, [drawGuide]);

    const drawSegment = useCallback((from: Point, to: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.strokeStyle = "oklch(0.32 0.09 163)";
      ctx.lineWidth = INK_LINE_WIDTH_PX;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();

      const umc = userMaskRef.current;
      if (!umc) return;
      const uctx = umc.getContext("2d");
      if (!uctx) return;
      uctx.save();
      uctx.strokeStyle = "#ffffff";
      uctx.lineWidth = MASK_LINE_WIDTH_PX;
      uctx.lineCap = "round";
      uctx.lineJoin = "round";
      uctx.beginPath();
      uctx.moveTo(from.x, from.y);
      uctx.lineTo(to.x, to.y);
      uctx.stroke();
      uctx.restore();
    }, []);

    const drawQuadraticStroke = useCallback((from: Point, ctrl: Point, to: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.strokeStyle = "oklch(0.32 0.09 163)";
      ctx.lineWidth = INK_LINE_WIDTH_PX;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
      ctx.stroke();
      ctx.restore();

      const umc = userMaskRef.current;
      if (!umc) return;
      const uctx = umc.getContext("2d");
      if (!uctx) return;
      uctx.save();
      uctx.strokeStyle = "#ffffff";
      uctx.lineWidth = MASK_LINE_WIDTH_PX;
      uctx.lineCap = "round";
      uctx.lineJoin = "round";
      uctx.beginPath();
      uctx.moveTo(from.x, from.y);
      uctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
      uctx.stroke();
      uctx.restore();
    }, []);

    const drawDot = useCallback((p: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.fillStyle = "oklch(0.32 0.09 163)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, INK_DOT_RADIUS_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const umc = userMaskRef.current;
      if (!umc) return;
      const uctx = umc.getContext("2d");
      if (!uctx) return;
      uctx.save();
      uctx.fillStyle = "#ffffff";
      uctx.beginPath();
      uctx.arc(p.x, p.y, MASK_DOT_RADIUS_PX, 0, Math.PI * 2);
      uctx.fill();
      uctx.restore();
    }, []);

    const replayInk = useCallback(() => {
      const { w, h } = cssSizeRef.current;
      if (w < 8 || h < 8) return;
      for (const cmd of inkCommandsRef.current) {
        if (cmd.kind === "segment") {
          drawSegment(toCss(cmd.from, w, h), toCss(cmd.to, w, h));
        } else if (cmd.kind === "quad") {
          drawQuadraticStroke(
            toCss(cmd.from, w, h),
            toCss(cmd.ctrl, w, h),
            toCss(cmd.to, w, h),
          );
        } else {
          drawDot(toCss(cmd.p, w, h));
        }
      }
    }, [drawSegment, drawQuadraticStroke, drawDot]);

    const syncMaskCanvases = useCallback(() => {
      if (!ensureMaskElements(guideMaskRef, userMaskRef)) return;
      const gmc = guideMaskRef.current;
      const umc = userMaskRef.current;
      if (!gmc || !umc) return;

      const { w, h } = cssSizeRef.current;
      const dpr = dprRef.current;
      if (w < 8 || h < 8) return;

      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      gmc.width = pw;
      gmc.height = ph;
      umc.width = pw;
      umc.height = ph;

      const fontFamily = getFontFamily();
      renderGuideMask(gmc, w, h, dpr, guideText, fontFamily);
      clearUserMaskCanvas(umc, w, h, dpr);
    }, [guideText, getFontFamily]);

    const clearUserInkOnly = useCallback(() => {
      const umc = userMaskRef.current;
      if (!umc) return;
      const { w, h } = cssSizeRef.current;
      const dpr = dprRef.current;
      if (w < 8 || h < 8) return;
      clearUserMaskCanvas(umc, w, h, dpr);
    }, []);

    const syncCanvasSize = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      dprRef.current = dpr;

      const w = container.clientWidth;
      const h = container.clientHeight;
      cssSizeRef.current = { w, h };

      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      redrawVisibleBase();
      syncMaskCanvases();
      replayInk();
    }, [redrawVisibleBase, syncMaskCanvases, replayInk]);

    const tryAgainResult = useCallback((): TraceScoreResult => {
      return {
        level: "try-again",
        coverage: 0,
        precision: 0,
        offGuideRatio: 0,
        sampledGuidePixels: 0,
        sampledUserPixels: 0,
        sampledOverlapPixels: 0,
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          inkCommandsRef.current = [];
          redrawVisibleBase();
          clearUserInkOnly();
          strokeRawRef.current = null;
          strokeMidRef.current = null;
          drawingRef.current = false;
        },
        check: () => {
          const gmc = guideMaskRef.current;
          const umc = userMaskRef.current;
          if (
            !gmc ||
            !umc ||
            gmc.width < 2 ||
            gmc.height < 2 ||
            gmc.width !== umc.width ||
            gmc.height !== umc.height
          ) {
            return tryAgainResult();
          }
          const gctx = gmc.getContext("2d", { willReadFrequently: true });
          const uctx = umc.getContext("2d", { willReadFrequently: true });
          if (!gctx || !uctx) return tryAgainResult();

          const gData = gctx.getImageData(0, 0, gmc.width, gmc.height);
          const uData = uctx.getImageData(0, 0, gmc.width, gmc.height);
          return scoreUserTrace(gData, uData);
        },
      }),
      [redrawVisibleBase, clearUserInkOnly, tryAgainResult],
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let frame = 0;
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => syncCanvasSize());
      };

      const ro = new ResizeObserver(schedule);
      ro.observe(container);
      schedule();

      void document.fonts.ready.then(schedule);

      window.addEventListener("orientationchange", schedule);

      return () => {
        cancelAnimationFrame(frame);
        ro.disconnect();
        window.removeEventListener("orientationchange", schedule);
      };
    }, [syncCanvasSize]);

    useEffect(() => {
      inkCommandsRef.current = [];
      redrawVisibleBase();
      syncMaskCanvases();
    }, [guideText, redrawVisibleBase, syncMaskCanvases]);

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const { w, h } = cssSizeRef.current;
      if (w < 8 || h < 8) return;

      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;

      const p = getOffsetCoords(canvas, e.nativeEvent);
      strokeMidRef.current = null;
      strokeRawRef.current = p;
      inkCommandsRef.current.push({ kind: "dot", p: toNorm(p, w, h) });
      drawDot(p);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;

      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const raw = strokeRawRef.current;
      if (!raw) return;

      const { w, h } = cssSizeRef.current;
      const native = e.nativeEvent;
      const coalesced =
        typeof native.getCoalescedEvents === "function"
          ? native.getCoalescedEvents()
          : [];
      const samples: PointerEvent[] =
        coalesced.length > 0 ? coalesced : [native];

      let prevRaw = raw;
      for (const ev of samples) {
        const p = getOffsetCoords(canvas, ev);
        const mid = {
          x: (prevRaw.x + p.x) / 2,
          y: (prevRaw.y + p.y) / 2,
        };
        const sm = strokeMidRef.current;

        if (sm === null) {
          inkCommandsRef.current.push({
            kind: "segment",
            from: toNorm(prevRaw, w, h),
            to: toNorm(mid, w, h),
          });
          drawSegment(prevRaw, mid);
        } else {
          inkCommandsRef.current.push({
            kind: "quad",
            from: toNorm(sm, w, h),
            ctrl: toNorm(prevRaw, w, h),
            to: toNorm(mid, w, h),
          });
          drawQuadraticStroke(sm, prevRaw, mid);
        }

        strokeMidRef.current = mid;
        prevRaw = p;
      }
      strokeRawRef.current = prevRaw;
    };

    const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;

      e.preventDefault();
      const canvas = canvasRef.current;
      if (canvas?.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }

      const { w, h } = cssSizeRef.current;
      const sm = strokeMidRef.current;
      const sr = strokeRawRef.current;
      if (sm !== null && sr !== null) {
        inkCommandsRef.current.push({
          kind: "segment",
          from: toNorm(sm, w, h),
          to: toNorm(sr, w, h),
        });
        drawSegment(sm, sr);
      }

      drawingRef.current = false;
      strokeMidRef.current = null;
      strokeRawRef.current = null;
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative min-h-[220px] w-full flex-1 touch-none select-none sm:min-h-[280px] md:min-h-[320px]",
          "overscroll-contain rounded-xl border border-primary/15 bg-card/60 ring-1 ring-border/50 shadow-inner",
          className,
        )}
      >
        <span
          ref={fontProbeRef}
          className="font-arabic pointer-events-none absolute left-0 top-0 text-[1px] opacity-0"
          dir="rtl"
          lang="ar"
          aria-hidden
        >
          {guideText}
        </span>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full cursor-crosshair rounded-[inherit]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          role="img"
          aria-label="Handwriting practice canvas. Trace over the faint guide."
        />
      </div>
    );
  },
);
