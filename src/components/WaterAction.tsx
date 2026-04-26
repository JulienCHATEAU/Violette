"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WaterCTA } from "@/design-system/components/WaterCTA";

type Props = {
  plantId: string;
  plantName: string;
};

type Phase = "idle" | "pending" | "celebrating" | "error";

const CELEBRATION_MS = 1500;

/**
 * WaterAction — orchestrates the watering peak moment.
 *
 * Composition:
 *  - DS `<WaterCTA>` for the inline burst + spinner + checkmark.
 *  - Local celebration overlay (§7) for a personalized "thank you" message.
 *
 * Network:
 *  - POST `/api/plants/{id}/water` with empty body, then `router.refresh()` so the
 *    detail page re-renders with the fresh `lastWateredAt`.
 *  - On failure: shake + inline error, no overlay, no refresh.
 *
 * Laws of UX:
 *  - Peak-End Rule: the celebration overlay is the high point of the screen.
 *  - Doherty Threshold: visual feedback is immediate (CTA pending state) regardless
 *    of network latency; overlay caps at 1.5s.
 */
export function WaterAction({ plantId, plantName }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const onWater = async (): Promise<void> => {
    setError(null);
    setPhase("pending");
    const res = await fetch(`/api/plants/${plantId}/water`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      setPhase("error");
      setError("Impossible d'enregistrer l'arrosage.");
      setShakeKey((n) => n + 1);
      // Throwing rolls back the inline DS WaterCTA to its idle state.
      throw new Error("water_failed");
    }
    setPhase("celebrating");
    dismissTimer.current = setTimeout(() => {
      setPhase("idle");
      router.refresh();
    }, CELEBRATION_MS);
  };

  return (
    <div className="space-y-3">
      <motion.div
        key={shakeKey}
        animate={phase === "error" && !prefersReduced ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
        transition={{ duration: 0.32 }}
      >
        <WaterCTA
          size="large"
          onWater={onWater}
          state={phase === "celebrating" ? "done" : phase === "pending" ? "pending" : "idle"}
          label="Je viens d'arroser"
          className="w-full"
        />
      </motion.div>
      {error ? (
        <p role="alert" className="font-sans text-sm text-terracotta-600 text-center">
          {error}
        </p>
      ) : null}
      <CelebrationOverlay show={phase === "celebrating"} plantName={plantName} />
    </div>
  );
}

function CelebrationOverlay({ show, plantName }: { show: boolean; plantName: string }) {
  const prefersReduced = useReducedMotion();
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            initial={prefersReduced ? false : { scale: 0.85, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-paper-50/95 paper-grain rounded-organic-1 shadow-lift px-8 py-7 max-w-[18rem] text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <CheckBadge />
            </div>
            <p className="font-serif italic text-lg text-ink-800 leading-snug">
              {plantName} te dit merci.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CheckBadge() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-moss-500 text-paper-50 shadow-paper">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5 12 10 17 19 8" />
      </svg>
    </span>
  );
}
