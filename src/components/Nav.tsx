"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Leaf } from "lucide-react";
import { CameraButton } from "./CameraButton";

export function Nav() {
  const path = usePathname();
  const isHome = path === "/";
  const isPlants = path.startsWith("/plants");

  if (path === "/login") return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-violet-100 dark:border-violet-900/30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur safe-bottom"
    >
      <ul className="max-w-xl mx-auto grid grid-cols-3 items-end">
        <li>
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 py-3 text-xs ${
              isHome ? "text-violet-700 dark:text-violet-300" : "text-zinc-500"
            }`}
          >
            <Home size={22} strokeWidth={isHome ? 2.2 : 1.8} />
            <span>Accueil</span>
          </Link>
        </li>
        <li className="relative flex justify-center">
          <CameraButton />
        </li>
        <li>
          <Link
            href="/plants"
            aria-current={isPlants ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 py-3 text-xs ${
              isPlants ? "text-violet-700 dark:text-violet-300" : "text-zinc-500"
            }`}
          >
            <Leaf size={22} strokeWidth={isPlants ? 2.2 : 1.8} />
            <span>Plantes</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
