import type { ReactNode } from "react";
import { cn } from "@/design-system/lib/cn";

/**
 * Local helpers for the design-system viz pages.
 * Not exported from the design system — these are demo scaffolding only.
 */

export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="mb-10">
      <p className="font-sans text-xs uppercase tracking-[0.16em] text-terracotta-500 mb-2">Design System</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-ink-800 leading-tight tracking-tight">{title}</h1>
      {lead ? <p className="mt-3 font-sans text-base text-ink-600 max-w-2xl">{lead}</p> : null}
    </header>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="font-serif text-xl text-ink-800 mb-1">{title}</h2>
      {description ? <p className="font-sans text-sm text-ink-600 mb-5 max-w-2xl">{description}</p> : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ExampleGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 | 4 }) {
  const colClass = cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-1 md:grid-cols-2" : cols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4";
  return <div className={cn("grid gap-4", colClass)}>{children}</div>;
}

export function ExampleCard({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="rounded-organic-2 bg-paper-50 paper-grain border border-paper-200 p-6">
      <p className="font-sans text-xs uppercase tracking-[0.14em] text-ink-400 mb-4">{label}</p>
      <div className={cn("flex items-center justify-center min-h-[6rem]", className)}>{children}</div>
    </div>
  );
}

export function Snippet({ code }: { code: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-organic-3 bg-ink-900 text-paper-50/90 text-xs font-mono px-4 py-3 leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}
