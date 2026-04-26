import { PageHeader, Section } from "../Demo";
import { PlantBubble } from "@/design-system/components/PlantBubble";
import type { BubblePosition } from "@/design-system/components/PlantBubble";

const POSITIONS: ReadonlyArray<{ position: BubblePosition; tilt: number; message: string }> = [
  { position: "top-right", tilt: -3, message: "J'ai soif !" },
  { position: "top-left", tilt: 4, message: "Encore deux jours et je serai parfaite." },
  { position: "bottom-right", tilt: -2, message: "Tu peux me déplacer un peu plus près de la fenêtre ?" },
  { position: "bottom-left", tilt: 3, message: "Merci pour cette bonne douche !" },
];

export default function BubblesPage() {
  return (
    <>
      <PageHeader
        title="Plant bubbles"
        lead="Le post-it qui donne une voix aux plantes. Tilt aléatoire et float très lent — désactivés automatiquement avec prefers-reduced-motion."
      />

      <Section title="Positions × tilts" description="Chaque bulle est positionnée en absolute dans son conteneur parent.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {POSITIONS.map((p) => (
            <div
              key={p.position}
              className="relative h-64 rounded-organic-2 bg-paper-100 paper-grain border border-paper-200 overflow-hidden"
            >
              <span className="absolute top-3 left-3 font-sans text-[10px] uppercase tracking-[0.14em] text-ink-400">
                {p.position} · tilt {p.tilt}°
              </span>
              <PlantBubble position={p.position} tilt={p.tilt} message={p.message} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tailles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-48 rounded-organic-2 bg-paper-100 paper-grain border border-paper-200">
            <span className="absolute top-3 left-3 font-sans text-[10px] uppercase tracking-[0.14em] text-ink-400">size: sm</span>
            <PlantBubble size="sm" message="Petit message" position="top-right" />
          </div>
          <div className="relative h-48 rounded-organic-2 bg-paper-100 paper-grain border border-paper-200">
            <span className="absolute top-3 left-3 font-sans text-[10px] uppercase tracking-[0.14em] text-ink-400">size: md</span>
            <PlantBubble size="md" message="Message un peu plus long pour évaluer le wrap." position="top-right" />
          </div>
        </div>
      </Section>
    </>
  );
}
