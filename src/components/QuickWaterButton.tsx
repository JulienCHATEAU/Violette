"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Droplet } from "@/design-system/icons";
import { cn } from "@/design-system/lib/cn";

type Props = {
  plantId: string;
  /** Called once the API confirmed the watering. The parent typically removes the card with an exit animation. */
  onWatered?: () => void;
  /** When the button is nested inside a `<Link>`, set this so taps don't trigger navigation. */
  stopPropagation?: boolean;
  className?: string;
};

type Phase = "idle" | "pending" | "done";
const DROPLET_ANGLES = [-Math.PI / 2, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6];

/**
 * QuickWaterButton — inline water action, sized for compact contexts (dashboard
 * urgent cards). Distinct from `WaterAction` which is the peak-moment CTA on the
 * detail page: this one fires-and-forgets with a tiny burst, no overlay.
 *
 * Laws of UX:
 *  - Fitts's Law: 48×48 hit area in the user's thumb arc on the urgent row.
 *  - Doherty Threshold: instant pending state, total feedback under 1s.
 */
export function QuickWaterButton({ plantId, onWatered, stopPropagation = false, className }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const prefersReduced = useReducedMotion();

  const onTap = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (phase !== "idle") return;
    setPhase("pending");
    try {
      const res = await fetch(`/api/plants/${plantId}/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("water_failed");
      setPhase("done");
      // Let the burst play before notifying the parent so the exit animation
      // chains naturally with the inline confirmation.
      setTimeout(() => onWatered?.(), 600);
    } catch {
      setPhase("idle");
    }
  };

  const isBusy = phase !== "idle";

  return (
    <motion.button
      type="button"
      onClick={onTap}
      disabled={isBusy}
      aria-label="Je viens d'arroser"
      whileTap={prefersReduced || isBusy ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative inline-flex items-center justify-center w-12 h-12 shrink-0",
        "bg-gradient-to-b from-terracotta-500 to-terracotta-600 text-paper-50",
        "rounded-[14px_18px_14px_18px] shadow-paper",
        "transition-shadow duration-180 ease-organic active:shadow-press",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-200",
        "disabled:cursor-default",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {phase === "idle" ? (
          <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Droplet size={18} />
          </motion.span>
        ) : phase === "pending" ? (
          <motion.span
            key="p"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden="true"
            className="h-4 w-4 rounded-full border-2 border-paper-50/60 border-t-paper-50 animate-spin"
          />
        ) : (
          <motion.span
            key="ok"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 12 10 17 19 8" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>

      {phase === "done" && !prefersReduced ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {DROPLET_ANGLES.map((angle, i) => {
            const dx = Math.cos(angle) * 22;
            const dy = Math.sin(angle) * 18;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], x: dx, y: dy, scale: [0.6, 1, 0.4] }}
                transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                className="absolute h-1.5 w-1.5 rounded-full bg-paper-50/95"
              />
            );
          })}
        </span>
      ) : null}
    </motion.button>
  );
}
