"use client";

import { forwardRef } from "react";
import type { HTMLAttributes, CSSProperties } from "react";
import { cn } from "../lib/cn";

export type BubblePosition = "top-right" | "top-left" | "bottom-left" | "bottom-right";
export type BubbleSize = "sm" | "md";

export type PlantBubbleProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  message: string;
  position?: BubblePosition;
  /** Tilt in degrees applied as the resting rotation. Defaults to -3. */
  tilt?: number;
  size?: BubbleSize;
};

const positionClasses: Record<BubblePosition, string> = {
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

const sizeClasses: Record<BubbleSize, string> = {
  sm: "max-w-[12rem] px-3 py-2 text-sm",
  md: "max-w-[16rem] px-4 py-3 text-base",
};

/** Tail shape — a small triangle anchored to the corner closest to the speaker. */
const tailClasses: Record<BubblePosition, string> = {
  "top-right":
    "after:content-[''] after:absolute after:-bottom-2 after:right-6 after:w-3 after:h-3 " +
    "after:bg-terracotta-50 after:border-r after:border-b after:border-terracotta-200 after:rotate-45",
  "top-left":
    "after:content-[''] after:absolute after:-bottom-2 after:left-6 after:w-3 after:h-3 " +
    "after:bg-terracotta-50 after:border-r after:border-b after:border-terracotta-200 after:rotate-45",
  "bottom-left":
    "after:content-[''] after:absolute after:-top-2 after:left-6 after:w-3 after:h-3 " +
    "after:bg-terracotta-50 after:border-l after:border-t after:border-terracotta-200 after:rotate-45",
  "bottom-right":
    "after:content-[''] after:absolute after:-top-2 after:right-6 after:w-3 after:h-3 " +
    "after:bg-terracotta-50 after:border-l after:border-t after:border-terracotta-200 after:rotate-45",
};

/**
 * PlantBubble — the personification post-it that gives plants a voice.
 * Drives the "petits messages" tone of the app.
 *
 * Laws of UX: Aesthetic-Usability Effect — slight tilt + soft float make the bubble
 * feel hand-placed rather than templated. Animation is suspended automatically by the
 * global `prefers-reduced-motion` rule in globals.css.
 */
export const PlantBubble = forwardRef<HTMLDivElement, PlantBubbleProps>(function PlantBubble(
  { message, position = "top-right", tilt = -3, size = "md", className, style, ...rest },
  ref,
) {
  const computedStyle: CSSProperties = {
    ...style,
    // Custom property consumed by the `bubble-float` keyframes for the resting rotation.
    ["--bubble-tilt" as keyof CSSProperties as string]: `${tilt}deg`,
    transform: `rotate(${tilt}deg)`,
  };

  return (
    <div
      ref={ref}
      role="note"
      aria-label="Message de la plante"
      style={computedStyle}
      className={cn(
        "absolute z-10 font-serif italic text-ink-800 leading-snug",
        "bg-terracotta-50 border border-terracotta-200 shadow-paper",
        "rounded-organic-2 motion-safe:animate-bubble-float origin-center",
        positionClasses[position],
        sizeClasses[size],
        tailClasses[position],
        className,
      )}
      {...rest}
    >
      “{message}”
    </div>
  );
});
