"use client";

import type { ReactNode, Ref } from "react";

import { cn } from "@/lib/utils";

import {
  type WritingCanvasHandle,
  WritingCanvas,
} from "./writing-canvas";

type Props = {
  canvasRef: Ref<WritingCanvasHandle>;
  guideText: string;
  showGuide?: boolean;
  onDrawingStart?: () => void;
  onStrokeEnd?: () => void;
  /** Slot for Clear / Check toolbar — same positioning as lesson-writing-section. */
  toolbar?: ReactNode;
  className?: string;
};

/** Same canvas shell as lesson practice — do not customize layout here. */
export function PracticeCanvasShell({
  canvasRef,
  guideText,
  showGuide = true,
  onDrawingStart,
  onStrokeEnd,
  toolbar,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "marketing-canvas-wrap relative overflow-hidden",
        className,
      )}
    >
      <WritingCanvas
        ref={canvasRef}
        guideText={guideText}
        showGuide={showGuide}
        onDrawingStart={onDrawingStart}
        onStrokeEnd={onStrokeEnd}
      />
      {toolbar}
    </div>
  );
}
