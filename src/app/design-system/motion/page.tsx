"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, Section, ExampleGrid, ExampleCard } from "../Demo";
import { Button } from "@/design-system/components/Button";
import { duration, easing } from "@/design-system/tokens/motion";

export default function MotionPage() {
  const [trigger, setTrigger] = useState(0);

  return (
    <>
      <PageHeader
        title="Motion"
        lead="Doherty Threshold : ≤ 400ms hors décoratif. Privilégier transform + opacity. Easings spring (rebondi) et organic (linéaire doux)."
      />

      <div className="mb-8">
        <Button variant="cta" onClick={() => setTrigger((v) => v + 1)}>
          Rejouer les démos
        </Button>
      </div>

      <Section title="Durations">
        <ExampleGrid cols={3}>
          {Object.entries(duration).map(([k, v]) => (
            <ExampleCard key={k} label={`${k} · ${v * 1000}ms`}>
              <motion.div
                key={`${k}-${trigger}`}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: v, ease: easing.organic }}
                className="h-12 w-24 rounded-organic-3 bg-terracotta-500"
              />
            </ExampleCard>
          ))}
        </ExampleGrid>
      </Section>

      <Section title="Easings" description="Même distance, même durée — seule la courbe change.">
        <ExampleGrid cols={2}>
          {Object.entries(easing).map(([k, v]) => (
            <ExampleCard key={k} label={`${k} · cubic-bezier(${v.join(", ")})`}>
              <motion.div
                key={`${k}-${trigger}`}
                initial={{ x: -60, scale: 0.9 }}
                animate={{ x: 60, scale: 1 }}
                transition={{ duration: 0.6, ease: v }}
                className="h-12 w-12 rounded-organic-3 bg-moss-500"
              />
            </ExampleCard>
          ))}
        </ExampleGrid>
      </Section>

      <Section
        title="Note accessibilité"
        description="La règle prefers-reduced-motion dans globals.css réduit à 0.01ms toutes les animations et transitions. Tester en activant 'Réduire les animations' au niveau OS."
      >
        <div className="rounded-organic-2 bg-white border border-paper-200 shadow-paper p-5 font-mono text-xs text-ink-800 whitespace-pre overflow-x-auto">
{`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`}
        </div>
      </Section>
    </>
  );
}
