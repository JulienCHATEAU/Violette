import { forwardRef } from "react";
import type { SVGAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type IconProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
  /** Pixel size for both width and height. Defaults to 24. */
  size?: number;
  /** Optional accessible label. When provided, role becomes "img"; otherwise the icon is hidden from AT. */
  title?: string;
  children?: ReactNode;
};

/**
 * Shared shell for all design-system line icons.
 * Stroke geometry (1.6, round caps & joins) gives the line-art / botanical feel
 * that distinguishes our custom set from generic icon libraries.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { size = 24, title, className, children, ...rest },
  ref,
) {
  const labelled = Boolean(title);
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
      className={cn("inline-block shrink-0", className)}
      {...rest}
    >
      {labelled ? <title>{title}</title> : null}
      {children}
    </svg>
  );
});
