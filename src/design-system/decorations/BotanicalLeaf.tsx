import { forwardRef } from "react";
import type { SVGAttributes } from "react";
import { cn } from "../lib/cn";

export type BotanicalLeafProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
  /** Pixel size for both width and height. Defaults to 120. */
  size?: number;
};

/**
 * BotanicalLeaf — herbarium-style line decoration.
 *
 * Used to add a subtle botanical touch behind/around hero blocks (page headers,
 * peak-moment cards). Inherits color from `currentColor`, so wrap in a colored
 * span or set `className="text-moss-500"`. Pair with `opacity-30 / 35` to keep
 * it behind the content.
 *
 * Accessibility: rendered with `aria-hidden` — purely decorative.
 */
export const BotanicalLeaf = forwardRef<SVGSVGElement, BotanicalLeafProps>(function BotanicalLeaf(
  { size = 120, className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("inline-block pointer-events-none", className)}
      {...rest}
    >
      {/* Outline of a single leaf */}
      <path d="M60 10 Q90 30 95 60 Q90 90 60 110 Q30 90 25 60 Q30 30 60 10 Z" strokeWidth="0.8" />
      {/* Central vein */}
      <path d="M60 10 L60 110" strokeWidth="0.6" />
      {/* Lateral veins */}
      <path d="M60 30 L40 40" strokeWidth="0.5" />
      <path d="M60 45 L38 55" strokeWidth="0.5" />
      <path d="M60 60 L36 70" strokeWidth="0.5" />
      <path d="M60 75 L40 82" strokeWidth="0.5" />
      <path d="M60 30 L80 40" strokeWidth="0.5" />
      <path d="M60 45 L82 55" strokeWidth="0.5" />
      <path d="M60 60 L84 70" strokeWidth="0.5" />
      <path d="M60 75 L80 82" strokeWidth="0.5" />
    </svg>
  );
});
