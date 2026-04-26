"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, Home, Leaf, Settings } from "@/design-system/icons";
import { cn } from "@/design-system/lib/cn";
import { CameraButton } from "./CameraButton";

/**
 * Bottom Nav — floating organic pill across the bottom of the viewport.
 *
 * Layout: 5 cells in the pill — Accueil + Mes plantes (left), centered FAB
 * Camera, Notifications + Réglages (right).
 *
 * Laws of UX:
 *  - Hick's Law: 5 cells but visually grouped (2 + FAB + 2), still scannable.
 *  - Jakob's Law: conventional bottom nav with centered FAB.
 *  - Fitts's Law: hit area ≥ 48px on each item; FAB sits in the thumb arc.
 *  - Aesthetic-Usability Effect: solid paper background pill with organic radii
 *    (was semi-transparent + backdrop-blur, but iOS Safari was repainting the
 *    blur on every scroll frame, causing jitter at the end of inertial scrolls).
 *  - Von Restorff Effect: terracotta-500 reserved for the active item and FAB.
 */
export function Nav() {
  const path = usePathname();
  const isHome = path === "/";
  const isPlants = path.startsWith("/plants");
  const isNotifications = path.startsWith("/notifications");
  const isSettings = path.startsWith("/settings");

  if (path === "/login") return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-40 px-5 pb-6 pt-2 safe-bottom"
    >
      <div className="max-w-xl mx-auto">
        <ul
          className={cn(
            "flex items-center py-2.5 px-2",
            "rounded-pill-organic shadow-paper border border-paper-200",
            "bg-paper-50",
            "transform-gpu",
          )}
        >
          <li className="flex-1 flex justify-center">
            <NavLink href="/" label="Accueil" active={isHome} icon={<Home size={20} />} />
          </li>
          <li className="flex-1 flex justify-center">
            <NavLink href="/plants" label="Plantes" active={isPlants} icon={<Leaf size={20} />} />
          </li>
          <li className="flex-1 flex justify-center">
            <CameraButton />
          </li>
          <li className="flex-1 flex justify-center">
            <NavLink href="/notifications" label="Notifs" active={isNotifications} icon={<Bell size={20} />} />
          </li>
          <li className="flex-1 flex justify-center">
            <NavLink href="/settings" label="Réglages" active={isSettings} icon={<Settings size={20} />} />
          </li>
        </ul>
      </div>
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
        "flex flex-col items-center justify-center gap-0.5 min-h-[48px] min-w-[48px] font-sans",
        "transition-colors duration-180 ease-organic",
        active ? "text-terracotta-500" : "text-ink-400 hover:text-ink-600",
      )}
    >
      <motion.span
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex flex-col items-center gap-0.5"
      >
        {icon}
        <span className={cn("text-[10px] tracking-wide", active ? "font-semibold" : "font-medium")}>
          {label}
        </span>
      </motion.span>
    </Link>
  );
}
