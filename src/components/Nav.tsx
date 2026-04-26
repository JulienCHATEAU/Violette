"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Home, Leaf } from "@/design-system/icons";
import { cn } from "@/design-system/lib/cn";
import { CameraButton } from "./CameraButton";

/**
 * Bottom Nav — main navigation across the app.
 *
 * Laws of UX:
 *  - Hick's Law: only 3 items (Home / FAB / Plants).
 *  - Jakob's Law: conventional bottom navigation pattern with centered FAB.
 *  - Fitts's Law: hit area ≥ 48px on each item; FAB lives in the thumb arc.
 *  - Von Restorff Effect: terracotta-500 reserved for the active item and the FAB —
 *    a single saturated color per screen.
 */
export function Nav() {
  const path = usePathname();
  const isHome = path === "/";
  const isPlants = path.startsWith("/plants");

  if (path === "/login") return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-paper-200 bg-paper-50/95 backdrop-blur safe-bottom"
    >
      <ul className="max-w-xl mx-auto grid grid-cols-3 items-end">
        <li>
          <NavLink href="/" label="Accueil" active={isHome} icon={<Home size={22} />} />
        </li>
        <li className="relative flex justify-center">
          <CameraButton />
        </li>
        <li>
          <NavLink href="/plants" label="Plantes" active={isPlants} icon={<Leaf size={22} />} />
        </li>
      </ul>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 py-3.5 min-h-[48px] font-sans text-xs",
        "transition-colors duration-180 ease-organic",
        active ? "text-terracotta-500" : "text-ink-400 hover:text-ink-600",
      )}
    >
      <motion.span
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex flex-col items-center gap-1"
      >
        {icon}
        <span>{label}</span>
      </motion.span>
      {active ? (
        <span aria-hidden="true" className="absolute -top-0.5 h-1 w-6 rounded-pill-organic bg-terracotta-500" />
      ) : null}
    </Link>
  );
}
