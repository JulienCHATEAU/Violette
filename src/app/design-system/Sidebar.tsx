"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/design-system/lib/cn";

type NavItem = { href: string; label: string };

const NAV: ReadonlyArray<NavItem> = [
  { href: "/design-system", label: "Overview" },
  { href: "/design-system/tokens", label: "Tokens" },
  { href: "/design-system/typography", label: "Typography" },
  { href: "/design-system/buttons", label: "Buttons" },
  { href: "/design-system/cards", label: "Cards" },
  { href: "/design-system/inputs", label: "Inputs" },
  { href: "/design-system/badges", label: "Badges" },
  { href: "/design-system/dialogs", label: "Dialogs" },
  { href: "/design-system/bubbles", label: "Plant bubbles" },
  { href: "/design-system/icons", label: "Icons" },
  { href: "/design-system/motion", label: "Motion" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = NAV.find((item) => item.href === pathname) ?? NAV[0];

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-paper-200 bg-paper-100/60 backdrop-blur sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-paper-200">
          <p className="font-serif text-xl text-ink-800 leading-tight">Violette</p>
          <p className="font-sans text-xs uppercase tracking-[0.16em] text-ink-400 mt-1">Design System</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const selected = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-pill-organic font-sans text-sm transition-colors duration-180 ease-organic",
                  selected
                    ? "bg-terracotta-500 text-paper-50 shadow-paper"
                    : "text-ink-600 hover:bg-paper-50 hover:text-ink-800",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-paper-200 text-xs font-sans text-ink-400">
          Dev only · NODE_ENV=development
        </div>
      </aside>

      {/* Mobile */}
      <div className="md:hidden sticky top-0 z-20 bg-paper-100/95 backdrop-blur border-b border-paper-200">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 font-sans"
          aria-expanded={mobileOpen}
        >
          <span className="font-serif text-base text-ink-800">
            Violette DS · <span className="text-terracotta-500">{active?.label ?? ""}</span>
          </span>
          <span className={cn("text-ink-600 transition-transform", mobileOpen && "rotate-180")}>▾</span>
        </button>
        {mobileOpen ? (
          <nav className="px-3 pb-3 space-y-1">
            {NAV.map((item) => {
              const selected = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-pill-organic font-sans text-sm",
                    selected ? "bg-terracotta-500 text-paper-50" : "text-ink-600 hover:bg-paper-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </>
  );
}
