"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../lib/cn";
import { Button } from "./Button";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use the destructive (terracotta) CTA when the confirmation removes data. */
  destructive?: boolean;
  children?: ReactNode;
};

/**
 * ConfirmDialog — accessible modal for destructive or important confirmations.
 *
 * Replaces the browser-native `confirm()` call with a DS-styled, animated dialog
 * that respects:
 *  - focus management (autofocus on the cancel button so destructive actions need a
 *    deliberate second tap)
 *  - keyboard dismissal via Escape
 *  - backdrop dismissal
 *  - `prefers-reduced-motion` (animation collapses to a fade)
 *  - body scroll lock while open
 *
 * Renders into a portal anchored to `document.body` so it escapes any clipping or
 * stacking context from the parent layout.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive = false,
  children,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={prefersReduced ? false : { y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { y: 24, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            className={cn(
              "w-full max-w-sm bg-paper-50 paper-grain rounded-organic-1 shadow-lift p-6",
              "flex flex-col gap-4",
            )}
          >
            <div className="space-y-2">
              <h2 id={titleId} className="font-serif text-xl text-ink-800 leading-tight">
                {title}
              </h2>
              {description ? (
                <p id={descId} className="font-sans text-sm text-ink-600 leading-relaxed">
                  {description}
                </p>
              ) : null}
              {children}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button ref={cancelRef} variant="ghost" size="sm" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? "cta" : "cta"}
                size="sm"
                onClick={() => {
                  void onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
