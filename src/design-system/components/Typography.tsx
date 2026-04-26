import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type ElementProps = HTMLAttributes<HTMLElement>;

/** Display title — Fraunces, used once per screen for the page hero. */
export const H1 = forwardRef<HTMLHeadingElement, ElementProps>(function H1({ className, children, ...rest }, ref) {
  return (
    <h1
      ref={ref}
      className={cn("font-serif text-4xl sm:text-5xl font-medium leading-[1.05] text-ink-800 tracking-tight", className)}
      {...rest}
    >
      {children}
    </h1>
  );
});

/** Section title. */
export const H2 = forwardRef<HTMLHeadingElement, ElementProps>(function H2({ className, children, ...rest }, ref) {
  return (
    <h2
      ref={ref}
      className={cn("font-serif text-2xl sm:text-3xl font-medium leading-tight text-ink-800 tracking-tight", className)}
      {...rest}
    >
      {children}
    </h2>
  );
});

/** Sub-section title. */
export const H3 = forwardRef<HTMLHeadingElement, ElementProps>(function H3({ className, children, ...rest }, ref) {
  return (
    <h3
      ref={ref}
      className={cn("font-serif text-xl font-semibold leading-snug text-ink-800", className)}
      {...rest}
    >
      {children}
    </h3>
  );
});

/** Default body copy — Plus Jakarta Sans. */
export const Body = forwardRef<HTMLParagraphElement, ElementProps>(function Body({ className, children, ...rest }, ref) {
  return (
    <p ref={ref} className={cn("font-sans text-base leading-relaxed text-ink-800", className)} {...rest}>
      {children}
    </p>
  );
});

/** Small ancillary copy — captions, helper text. */
export const Caption = forwardRef<HTMLParagraphElement, ElementProps>(function Caption({ className, children, ...rest }, ref) {
  return (
    <p ref={ref} className={cn("font-sans text-sm leading-normal text-ink-600", className)} {...rest}>
      {children}
    </p>
  );
});

/** Uppercase eyebrow / form label. */
export const Label = forwardRef<HTMLSpanElement, ElementProps>(function Label({ className, children, ...rest }, ref) {
  return (
    <span
      ref={ref}
      className={cn("font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600", className)}
      {...rest}
    >
      {children}
    </span>
  );
});

/** Italic Fraunces — reserved for botanical names and personified plant voice. */
export const Italic = forwardRef<HTMLElement, ElementProps>(function Italic({ className, children, ...rest }, ref) {
  return (
    <em ref={ref} className={cn("font-serif italic text-ink-800", className)} {...rest}>
      {children}
    </em>
  );
});
