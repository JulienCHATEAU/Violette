import { PageHeader, Section, ExampleGrid, ExampleCard } from "../Demo";
import { colors } from "@/design-system/tokens/colors";
import { duration, easing } from "@/design-system/tokens/motion";
import { radii } from "@/design-system/tokens/radii";

type Scale = Record<string, string>;

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-10 w-10 rounded-organic-3 border border-paper-200 shrink-0" style={{ background: hex }} />
      <div className="font-sans text-xs leading-tight">
        <p className="font-semibold text-ink-800">{name}</p>
        <p className="text-ink-400">{hex}</p>
      </div>
    </div>
  );
}

function ScaleBlock({ name, scale }: { name: string; scale: Scale }) {
  return (
    <div className="rounded-organic-2 bg-white border border-paper-200 shadow-paper p-5">
      <p className="font-serif text-base text-ink-800 mb-4 capitalize">{name}</p>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(scale).map(([step, hex]) => (
          <Swatch key={step} name={`${name}-${step}`} hex={hex} />
        ))}
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <>
      <PageHeader
        title="Tokens"
        lead="Les fondations brutes du design system : couleurs, radii, ombres, motion. À titre informatif uniquement — préférer les utilitaires Tailwind dans le code."
      />

      <Section
        title="Palette"
        description="Quatre familles : terracotta (action, Von Restorff), moss (végétal calme), paper (fonds), ink (texte)."
      >
        <ExampleGrid cols={2}>
          <ScaleBlock name="terracotta" scale={colors.terracotta} />
          <ScaleBlock name="moss" scale={colors.moss} />
          <ScaleBlock name="paper" scale={colors.paper} />
          <ScaleBlock name="ink" scale={colors.ink} />
        </ExampleGrid>
      </Section>

      <Section
        title="Contraste WCAG"
        description="Vérification visuelle des combinaisons clés (cible AA ≥ 4.5:1 pour le texte courant)."
      >
        <ExampleGrid cols={3}>
          <ExampleCard label="ink-800 / paper-50">
            <span className="font-serif text-lg text-ink-800">Texte courant lisible</span>
          </ExampleCard>
          <ExampleCard label="terracotta-500 / paper-50">
            <span className="font-serif text-lg text-terracotta-500">Action — usage rare</span>
          </ExampleCard>
          <ExampleCard label="paper-50 / terracotta-500">
            <span className="rounded-pill-organic bg-terracotta-500 px-4 py-2 text-paper-50 font-sans font-semibold">CTA principal</span>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Border radius — organiques" description="Coins irréguliers évoquant le papier pressé.">
        <ExampleGrid cols={4}>
          {Object.entries(radii).map(([name, value]) => (
            <ExampleCard key={name} label={name}>
              <div
                className="h-20 w-20 bg-terracotta-200 border border-terracotta-400"
                style={{ borderRadius: value }}
              />
            </ExampleCard>
          ))}
        </ExampleGrid>
      </Section>

      <Section title="Shadows" description="Ombres papier — superposées plutôt que floutées.">
        <ExampleGrid cols={3}>
          <ExampleCard label="shadow-paper">
            <div className="h-20 w-32 bg-white rounded-organic-2 shadow-paper" />
          </ExampleCard>
          <ExampleCard label="shadow-lift">
            <div className="h-20 w-32 bg-white rounded-organic-2 shadow-lift" />
          </ExampleCard>
          <ExampleCard label="shadow-press (inset)">
            <div className="h-20 w-32 bg-paper-100 rounded-organic-2 shadow-press" />
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Motion tokens" description="Durations en secondes, easings en cubic-bezier.">
        <div className="rounded-organic-2 bg-white border border-paper-200 shadow-paper p-5 space-y-4">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.14em] text-ink-400 mb-2">Durations</p>
            <div className="flex gap-6 font-mono text-sm text-ink-800">
              {Object.entries(duration).map(([k, v]) => (
                <span key={k}>
                  <span className="font-semibold">{k}</span> = {v}s
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.14em] text-ink-400 mb-2">Easings</p>
            <div className="space-y-1 font-mono text-sm text-ink-800">
              {Object.entries(easing).map(([k, v]) => (
                <p key={k}>
                  <span className="font-semibold">{k}</span> = cubic-bezier({v.join(", ")})
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
