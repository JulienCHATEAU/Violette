"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/plants", label: "Plantes", icon: "🌿" },
  { href: "/plants/new", label: "Ajouter", icon: "➕" },
  { href: "/settings", label: "Réglages", icon: "⚙️" },
] as const;

export function Nav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-white/90 dark:bg-zinc-900/90 backdrop-blur safe-bottom"
    >
      <ul className="max-w-xl mx-auto grid grid-cols-4">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center py-2 text-xs ${
                  active ? "text-leaf-700 dark:text-leaf-200" : "text-zinc-500"
                }`}
              >
                <span aria-hidden className="text-xl">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
