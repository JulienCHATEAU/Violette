import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

/**
 * Dev-only design system module.
 *
 * Server-side gate: any request outside `NODE_ENV === "development"` is mapped to a
 * 404 before any DS code runs. This keeps the entire `/design-system` route tree out
 * of production builds without touching the middleware.
 *
 * The wrapper is positioned `fixed inset-0` to escape the parent root-layout
 * constraints (`max-w-xl` + bottom Nav). `color-scheme: light` forces the paper
 * palette regardless of the user's OS dark-mode preference.
 */
export default function DesignSystemLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div
      className="fixed inset-0 z-40 overflow-auto bg-paper-50 text-ink-800 font-sans flex flex-col md:flex-row"
      style={{ colorScheme: "light" }}
    >
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 sm:px-10 py-10 max-w-5xl">{children}</main>
    </div>
  );
}
