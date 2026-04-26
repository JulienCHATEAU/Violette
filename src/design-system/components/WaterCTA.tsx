"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../lib/cn";
import { Droplet } from "../icons/Droplet";

export type WaterCTAState = "idle" | "pending" | "done";
export type WaterCTASize = "inline" | "large";

export type WaterCTAProps = {
  state?: WaterCTAState;
  /** Called when the user taps the CTA (idle state only). May return a promise. */
  onWater: () => void | Promise<void>;
  /** Optional controlled-state callback when the internal state machine transitions. */
  onStateChange?: (state: WaterCTAState) => void;
  size?: WaterCTASize;
  /** Idle label, defaults to "Arroser". */
  label?: string;
  className?: string;
};

const DROPLET_COUNT = 5;

const sizeClasses: Record<WaterCTASize, string> = {
  inline: "h-12 px-6 text-base gap-2",
  large: "h-16 px-10 text-lg gap-3",
};

/**
 * WaterCTA — the signature watering action.
 *
 * State machine:
 *  idle → pending (user tap, awaits onWater)
 *  pending → done (resolves with droplet burst + checkmark)
 *  done → idle (auto-revert after 2s)
 *
 * Laws of UX: Peak-End Rule — the celebratory burst at completion is the moment we
 * want users to remember about caring for their plant. Total animation ≤ 1.2s
 * (Doherty Threshold). Honors `prefers-reduced-motion`: still transitions through
 * states but skips the burst animation.
 */
export const WaterCTA = forwardRef<HTMLButtonElement, WaterCTAProps>(function WaterCTA(
  { state: controlledState, onWater, onStateChange, size = "large", label = "Arroser", className },
  ref,
) {
  const [internalState, setInternalState] = useState<WaterCTAState>("idle");
  const state = controlledState ?? internalState;
  const prefersReduced = useReducedMotion();
  const revertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revertTimeout.current) clearTimeout(revertTimeout.current);
    };
  }, []);

  const transition = (next: WaterCTAState): void => {
    if (controlledState === undefined) setInternalState(next);
    onStateChange?.(next);
  };

  const handleClick = async (): Promise<void> => {
    if (state !== "idle") return;
    transition("pending");
    try {
      await onWater();
      transition("done");
      revertTimeout.current = setTimeout(() => transition("idle"), 2000);
    } catch {
      transition("idle");
    }
  };

  const isBusy = state !== "idle";

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-live="polite"
      aria-label={state === "done" ? "Plante arrosée" : label}
      whileTap={prefersReduced || isBusy ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative inline-flex items-center justify-center font-sans font-semibold select-none",
        "rounded-pill-organic shadow-paper transition-colors duration-180 ease-organic",
        "bg-gradient-to-b from-terracotta-500 to-terracotta-600 text-paper-50",
        "hover:from-terracotta-500 hover:to-terracotta-700 active:shadow-press",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-200",
        "disabled:cursor-default",
        sizeClasses[size],
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-2"
          >
            <Droplet size={20} />
            {label}
          </motion.span>
        )}
        {state === "pending" && (
          <motion.span
            key="pending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center"
          >
            <span
              className="h-5 w-5 rounded-full border-2 border-paper-50/60 border-t-paper-50 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Arrosage en cours</span>
          </motion.span>
        )}
        {state === "done" && (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-2"
          >
            <CheckmarkBadge />
            <span>Bien arrosée</span>
          </motion.span>
        )}
      </AnimatePresence>

      {state === "done" && !prefersReduced ? <DropletBurst /> : null}
    </motion.button>
  );
});

function CheckmarkBadge() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-moss-500 text-paper-50">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5 12 10 17 19 8" />
      </svg>
    </span>
  );
}

function DropletBurst() {
  // Pre-computed angles around the button center for a balanced spray.
  const angles = Array.from({ length: DROPLET_COUNT }, (_, i) => (i / DROPLET_COUNT) * Math.PI * 2);
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {angles.map((angle, i) => {
        const dx = Math.cos(angle) * 38;
        const dy = Math.sin(angle) * 32 - 8;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], x: dx, y: dy, scale: [0.6, 1, 0.4] }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.04 }}
            className="absolute h-2 w-2 rounded-full bg-paper-50/95"
          />
        );
      })}
    </span>
  );
}
