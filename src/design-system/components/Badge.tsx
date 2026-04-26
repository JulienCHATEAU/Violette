import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type BadgeVariant = "urgent" | "soon" | "ok" | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  icon?: ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  urgent: "bg-terracotta-500 text-paper-50",
  soon: "bg-paper-200 text-ink-800",
  ok: "bg-moss-100 text-moss-700",
  info: "bg-paper-100 text-ink-600 border border-paper-200",
};

/**
 * Badge — short status pill.
 * Laws of UX: Von Restorff Effect — `urgent` uses terracotta-500, the page's only
 * truly attention-grabbing color, so use sparingly.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "info", icon, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-xs font-semibold",
        "px-2.5 py-1 rounded-pill-organic",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
});
