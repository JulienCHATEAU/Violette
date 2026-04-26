"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

/* ────────────────────────────────────────────────────────────────────────── */
/* TextInput                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

/**
 * TextInput — single-line input with paper-like border and terracotta focus ring.
 * Placeholder is rendered in italic Fraunces to feel like a handwritten cue.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, invalid, type = "text", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "block w-full font-sans text-base text-ink-800 bg-paper-50",
        "border border-paper-300 rounded-organic-3 px-4 py-3",
        "placeholder:font-serif placeholder:italic placeholder:text-ink-400",
        "transition-shadow duration-180 ease-organic",
        "focus:outline-none focus:ring-4 focus:ring-terracotta-500/20 focus:border-terracotta-400",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        invalid && "border-terracotta-500 focus:ring-terracotta-500/30",
        className,
      )}
      {...rest}
    />
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
/* TextArea                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

/**
 * TextArea — multi-line variant of TextInput, sharing focus ring and placeholder
 * styling so they read as a coherent input family.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, invalid, rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "block w-full font-sans text-base text-ink-800 bg-paper-50",
        "border border-paper-300 rounded-organic-3 px-4 py-3 resize-y",
        "placeholder:font-serif placeholder:italic placeholder:text-ink-400",
        "transition-shadow duration-180 ease-organic",
        "focus:outline-none focus:ring-4 focus:ring-terracotta-500/20 focus:border-terracotta-400",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        invalid && "border-terracotta-500 focus:ring-terracotta-500/30",
        className,
      )}
      {...rest}
    />
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
/* NumberStepper                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export type NumberStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Visually hidden label, required for assistive tech. */
  label: string;
  unit?: string;
  className?: string;
};

/**
 * NumberStepper — large central value flanked by circular − / + buttons.
 * Laws of UX: Fitts's Law (44px hit targets), Aesthetic-Usability (Fraunces 3xl value).
 */
export const NumberStepper = forwardRef<HTMLDivElement, NumberStepperProps>(function NumberStepper(
  { value, onChange, min = 0, max = 99, step = 1, label, unit, className },
  ref,
) {
  const clamp = (n: number): number => Math.min(max, Math.max(min, n));
  const decrement = (): void => onChange(clamp(value - step));
  const increment = (): void => onChange(clamp(value + step));
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <div
      ref={ref}
      className={cn("inline-flex items-center gap-4", className)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={decDisabled}
        aria-label={`Diminuer ${label}`}
        className={cn(
          "h-11 w-11 rounded-full bg-paper-50 border border-paper-300 shadow-paper",
          "text-ink-800 text-xl leading-none",
          "transition-colors duration-180 ease-organic hover:bg-paper-100",
          "active:shadow-press disabled:opacity-40 disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20",
        )}
      >
        −
      </button>
      <div className="min-w-[5rem] text-center" aria-live="polite">
        <span className="font-serif text-3xl text-ink-800 tabular-nums">{value}</span>
        {unit ? <span className="ml-1 font-sans text-sm text-ink-600">{unit}</span> : null}
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={incDisabled}
        aria-label={`Augmenter ${label}`}
        className={cn(
          "h-11 w-11 rounded-full bg-paper-50 border border-paper-300 shadow-paper",
          "text-ink-800 text-xl leading-none",
          "transition-colors duration-180 ease-organic hover:bg-paper-100",
          "active:shadow-press disabled:opacity-40 disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20",
        )}
      >
        +
      </button>
    </div>
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
/* SegmentedControl                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: ReadonlyArray<SegmentOption<T>>;
  ariaLabel: string;
  className?: string;
};

/**
 * SegmentedControl — radio-style picker with an inline visual highlight.
 * Use for short, mutually exclusive choices (3-5 options max).
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex p-1 bg-paper-100 border border-paper-200 rounded-pill-organic gap-1",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 h-10 rounded-pill-organic font-sans text-sm font-medium",
              "transition-colors duration-180 ease-organic",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20",
              selected
                ? "bg-terracotta-500 text-paper-50 shadow-paper"
                : "text-ink-600 hover:text-ink-800 hover:bg-paper-50",
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
