import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type CardRadius = "organic-1" | "organic-2" | "organic-3" | "pill-organic" | "none";
export type CardElevation = "flat" | "paper" | "lift";
export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  radius?: CardRadius;
  elevation?: CardElevation;
  padding?: CardPadding;
  /** Layer the paper-grain texture on top of the card background. */
  textured?: boolean;
};

const radiusClasses: Record<CardRadius, string> = {
  "organic-1": "rounded-organic-1",
  "organic-2": "rounded-organic-2",
  "organic-3": "rounded-organic-3",
  "pill-organic": "rounded-pill-organic",
  none: "rounded-none",
};

const elevationClasses: Record<CardElevation, string> = {
  flat: "shadow-none border border-paper-200",
  paper: "shadow-paper",
  lift: "shadow-lift",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Card — content container with organic radii and paper-like shadows.
 * Laws of UX: Aesthetic-Usability Effect (irregular corners feel hand-pressed).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { radius = "organic-1", elevation = "paper", padding = "md", textured = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white text-ink-800",
        radiusClasses[radius],
        elevationClasses[elevation],
        paddingClasses[padding],
        textured && "paper-grain",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
