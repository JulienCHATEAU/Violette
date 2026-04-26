#!/usr/bin/env bash
# scripts/cleanup-phase2.sh
# Nettoyage post-refonte UX/UI Phase 2.
# Idempotent : peut être relancé sans effet de bord.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

B=$(tput bold 2>/dev/null || true)
G=$(tput setaf 2 2>/dev/null || true)
R=$(tput setaf 1 2>/dev/null || true)
Y=$(tput setaf 3 2>/dev/null || true)
N=$(tput sgr0  2>/dev/null || true)

step() { echo ""; echo "${B}${G}▶ $*${N}"; }
warn() { echo "${Y}⚠ $*${N}"; }
fail() { echo "${R}✗ $*${N}"; exit 1; }

step "Pré-conditions"
[ -f package.json ] || fail "Lance ce script depuis la racine du projet."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Pas un dépôt git."
echo "  branche : $(git branch --show-current)"

step "Audit lucide-react (doit être 0)"
LUCIDE_USES=$(grep -rl "lucide-react" src tests 2>/dev/null || true)
if [ -n "$LUCIDE_USES" ]; then
  fail "lucide-react encore importé :
$LUCIDE_USES"
fi
echo "  ✓ aucun import"

step "1/5 — Désinstallation de lucide-react"
if grep -q '"lucide-react"' package.json; then
  npm uninstall lucide-react
else
  warn "déjà absent du package.json"
fi

step "2/5 — Réécriture src/lib/watering.ts (suppression statusColor + statusLabel)"
cat > src/lib/watering.ts <<'EOF'
export type WateringStatus = "overdue" | "due" | "soon" | "ok";

export function computeWatering(last: Date, freqDays: number, now: Date = new Date()) {
  const next = new Date(last.getTime() + freqDays * 86_400_000);
  const diffDays = Math.round((next.getTime() - now.getTime()) / 86_400_000);
  let status: WateringStatus;
  if (diffDays < 0) status = "overdue";
  else if (diffDays === 0) status = "due";
  else if (diffDays === 1) status = "soon";
  else status = "ok";
  return { next, diffDays, status };
}

export const SUNLIGHT_LABEL: Record<string, string> = {
  full_sun: "Plein soleil",
  partial_shade: "Mi-ombre",
  shade: "Ombre",
  indirect_light: "Lumière indirecte",
};

export const HUMIDITY_LABEL: Record<string, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};
EOF
echo "  ✓ statusColor + statusLabel retirés (UI couverte par <Badge> DS)"

step "3/5 — Réécriture tests/watering.test.ts (suppression du bloc statusLabel)"
cat > tests/watering.test.ts <<'EOF'
import { describe, expect, it } from "vitest";
import { computeWatering } from "../src/lib/watering";

const DAY = 86_400_000;

describe("computeWatering", () => {
  const now = new Date("2026-04-20T12:00:00Z");

  it("returns 'overdue' when last watering is older than frequency", () => {
    const last = new Date(now.getTime() - 10 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("overdue");
    expect(r.diffDays).toBe(-3);
  });

  it("returns 'due' when next watering falls today", () => {
    const last = new Date(now.getTime() - 7 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("due");
    expect(r.diffDays).toBe(0);
  });

  it("returns 'soon' when next watering is tomorrow", () => {
    const last = new Date(now.getTime() - 6 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("soon");
    expect(r.diffDays).toBe(1);
  });

  it("returns 'ok' when plenty of time remains", () => {
    const last = new Date(now.getTime() - 1 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("ok");
    expect(r.diffDays).toBe(6);
  });
});
EOF
echo "  ✓ bloc statusLabel retiré, tests computeWatering préservés"

step "4/5 — Réécriture tailwind.config.ts (suppression palettes violet/sage + shadow-soft)"
cat > tailwind.config.ts <<'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design system "Herbier moderne"
        terracotta: {
          50: "#FBF1EC",
          100: "#F1D8CC",
          200: "#E5BBA8",
          400: "#D17B5C",
          500: "#C4583E",
          600: "#A8402A",
          700: "#7A2A1A",
        },
        moss: {
          50: "#EFF1EA",
          100: "#DBE0CC",
          200: "#B9C3A0",
          400: "#7D8E6A",
          500: "#5C6F4F",
          600: "#445436",
          700: "#2D3A22",
        },
        paper: {
          50: "#FAF6EC",
          100: "#F4ECDD",
          200: "#E9DEC4",
          300: "#D9C9A4",
        },
        ink: {
          400: "#8C7A6E",
          600: "#5A4A40",
          800: "#2B1F1A",
          900: "#1A1310",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "organic-1": "28px 36px 28px 40px",
        "organic-2": "36px 28px 40px 28px",
        "organic-3": "32px 32px 40px 28px",
        "pill-organic": "22px 26px 22px 26px",
      },
      boxShadow: {
        paper: "0 1px 2px rgba(43,31,26,.06), 0 8px 24px -12px rgba(43,31,26,.18)",
        lift: "0 2px 4px rgba(43,31,26,.08), 0 18px 38px -16px rgba(43,31,26,.25)",
        press: "inset 0 2px 4px rgba(43,31,26,.10)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(.34, 1.56, .64, 1)",
        organic: "cubic-bezier(.4, 0, .2, 1)",
      },
      transitionDuration: {
        "180": "180ms",
        "250": "250ms",
        "400": "400ms",
      },
      keyframes: {
        "bubble-float": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--bubble-tilt, -3deg))" },
          "50%": { transform: "translateY(-4px) rotate(calc(var(--bubble-tilt, -3deg) + 1deg))" },
        },
      },
      animation: {
        "bubble-float": "bubble-float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
EOF
echo "  ✓ palettes violet/sage + shadow-soft retirés"

step "5/5 — Réécriture src/app/globals.css (variables alignées DS, dark mode obsolète retiré)"
cat > src/app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  --bg: #FAF6EC;
  --fg: #2B1F1A;
}

html, body { height: 100%; }
body {
  background: var(--bg);
  color: var(--fg);
  -webkit-tap-highlight-color: transparent;
  padding-top: env(safe-area-inset-top);
}

.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* Design system — paper grain texture, used as a subtle background on cards/panels. */
.paper-grain {
  background-image:
    radial-gradient(rgba(90, 74, 64, 0.04) 1px, transparent 1px),
    radial-gradient(rgba(90, 74, 64, 0.03) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
}

/* Design system — Fraunces serif fine-tuning (stylistic sets + tighter tracking). */
.font-serif { font-feature-settings: "ss01", "ss02"; letter-spacing: -0.01em; }

/* Accessibility — global motion guard. Components also check this at runtime when needed. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
EOF
echo "  ✓ --bg/--fg en paper-50/ink-800, bloc dark mode retiré"

step "Vérifications"
echo "→ typecheck" ; npm run typecheck
echo "→ lint" ;     npm run lint
echo "→ tests" ;    npm test
echo "→ build" ;    npm run build

step "Done — état git"
git status --short

echo ""
echo "${B}${G}✓ Cleanup Phase 2 terminé.${N}"
echo "Étapes restantes (manuelles) :"
echo "  • Reviewer le diff (git diff)"
echo "  • Commit + push de la branche"