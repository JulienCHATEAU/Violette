"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../lib/cn";

export type ButtonVariant = "cta" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof HTMLMotionProps<"button">
>;

type MotionButtonProps = Omit<HTMLMotionProps<"button">, "children">;

export type ButtonProps = NativeButtonProps &
  MotionButtonProps & {
    children?: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    /** Visually hidden label, required when variant="icon" with no text children. */
    "aria-label"?: string;
  };

const variantClasses: Record<ButtonVariant, string> = {
  cta:
    "bg-gradient-to-b from-terracotta-500 to-terracotta-600 text-paper-50 shadow-paper " +
    "hover:from-terracotta-500 hover:to-terracotta-700 active:shadow-press " +
    "focus-visible:ring-terracotta-200",
  secondary:
    "bg-paper-50 text-ink-800 border border-paper-300 shadow-paper " +
    "hover:bg-paper-100 active:shadow-press focus-visible:ring-terracotta-200",
  ghost:
    "bg-transparent text-ink-800 hover:bg-paper-100 focus-visible:ring-terracotta-200",
  icon:
    "bg-paper-50/95 backdrop-blur text-ink-800 border border-paper-200 shadow-paper " +
    "hover:bg-paper-100 active:shadow-press focus-visible:ring-terracotta-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-base gap-2",
  lg: "h-14 px-7 text-lg gap-2.5",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 w-9 p-0",
  md: "h-11 w-11 p-0",
  lg: "h-12 w-12 p-0",
};

/**
 * Button — primary interactive control of the design system.
 *
 * Laws of UX:
 *  - Fitts's Law: `md` (44px) is the minimum recommended size on touch devices.
 *  - Aesthetic-Usability Effect: subtle whileTap scale + shadow swap suggests responsiveness.
 *
 * Honors `prefers-reduced-motion`: tap animation is suppressed when requested.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    leadingIcon,
    trailingIcon,
    className,
    children,
    type = "button",
    disabled,
    ...rest
  },
  ref,
) {
  const prefersReduced = useReducedMotion();
  const isIcon = variant === "icon";

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      whileTap={prefersReduced || disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center font-sans font-semibold select-none",
        "transition-colors duration-180 ease-organic",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-0",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        isIcon ? "rounded-full" : "rounded-pill-organic",
        isIcon ? iconSizeClasses[size] : sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </motion.button>
  );
});
