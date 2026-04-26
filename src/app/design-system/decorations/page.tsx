import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { BotanicalLeaf } from "@/design-system/decorations/BotanicalLeaf";

export default function DecorationsPage() {
  return (
    <>
      <PageHeader
        title="Decorations"
        lead="Éléments graphiques décoratifs (aria-hidden) pour ponctuer un écran. À utiliser avec parcimonie — toujours en background ou subtil overlay."
      />

      <Section title="BotanicalLeaf" description="Feuille botanique style herbier. Hérite de currentColor.">
        <ExampleGrid cols={3}>
          <ExampleCard label="moss-500 / opacity 35">
            <BotanicalLeaf size={120} className="text-moss-500 opacity-35" />
          </ExampleCard>
          <ExampleCard label="terracotta-500 / opacity 30">
            <BotanicalLeaf size={120} className="text-terracotta-500 opacity-30" />
          </ExampleCard>
          <ExampleCard label="ink-600 / opacity 18">
            <BotanicalLeaf size={120} className="text-ink-600 opacity-[.18]" />
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Tailles">
        <ExampleCard label="60 / 80 / 120 / 160">
          <div className="flex items-end gap-6 text-moss-500 opacity-35">
            <BotanicalLeaf size={60} />
            <BotanicalLeaf size={80} />
            <BotanicalLeaf size={120} />
            <BotanicalLeaf size={160} />
          </div>
        </ExampleCard>
      </Section>
    </>
  );
}
