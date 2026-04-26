import { PageHeader, Section } from "../Demo";
import {
  Droplet,
  Leaf,
  Sun,
  Cloud,
  Thermometer,
  Clock,
  Camera,
  Plus,
  ArrowLeft,
  Home,
  PlantPot,
  Sparkles,
  Settings,
} from "@/design-system/icons";

const ICONS = [
  { name: "Droplet", Comp: Droplet },
  { name: "Leaf", Comp: Leaf },
  { name: "Sun", Comp: Sun },
  { name: "Cloud", Comp: Cloud },
  { name: "Thermometer", Comp: Thermometer },
  { name: "Clock", Comp: Clock },
  { name: "Camera", Comp: Camera },
  { name: "Plus", Comp: Plus },
  { name: "ArrowLeft", Comp: ArrowLeft },
  { name: "Home", Comp: Home },
  { name: "PlantPot", Comp: PlantPot },
  { name: "Sparkles", Comp: Sparkles },
  { name: "Settings", Comp: Settings },
] as const;

export default function IconsPage() {
  return (
    <>
      <PageHeader
        title="Icons"
        lead="Set custom 12 icônes line-art : stroke 1.6, linecap round. Identité visuelle de Violette — préférer ce set à lucide-react pour les écrans de production."
      />

      <Section title="Le set complet">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {ICONS.map(({ name, Comp }) => (
            <div
              key={name}
              className="rounded-organic-2 bg-paper-50 paper-grain border border-paper-200 p-5 flex flex-col items-center justify-center gap-3 text-ink-800"
            >
              <Comp size={28} />
              <span className="font-mono text-[11px] text-ink-600">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tailles" description="Le composant accepte une prop `size` (px). Stroke fixe pour préserver l'épaisseur.">
        <div className="flex items-end gap-6 rounded-organic-2 bg-paper-50 paper-grain border border-paper-200 p-6 text-ink-800">
          <Leaf size={16} />
          <Leaf size={20} />
          <Leaf size={24} />
          <Leaf size={32} />
          <Leaf size={48} />
        </div>
      </Section>

      <Section title="Couleurs" description="Hérite de `currentColor` — pilote la teinte via Tailwind.">
        <div className="flex items-center gap-6 rounded-organic-2 bg-paper-50 paper-grain border border-paper-200 p-6">
          <Droplet size={28} className="text-ink-800" />
          <Droplet size={28} className="text-terracotta-500" />
          <Droplet size={28} className="text-moss-500" />
          <Droplet size={28} className="text-ink-400" />
        </div>
      </Section>
    </>
  );
}
