"use client";

import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { Button } from "@/design-system/components/Button";
import { WaterCTA } from "@/design-system/components/WaterCTA";
import { Droplet, Plus, Camera, ArrowLeft } from "@/design-system/icons";

export default function ButtonsPage() {
  const noop = () => {};
  const fakeWater = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 700));

  return (
    <>
      <PageHeader
        title="Buttons"
        lead="Variants : cta, secondary, ghost, icon. Tailles sm / md / lg. Animation whileTap (scale .96) suspendue automatiquement si prefers-reduced-motion."
      />

      <Section title="Variants × tailles">
        <ExampleGrid cols={3}>
          <ExampleCard label="cta · md">
            <Button variant="cta" onClick={noop} leadingIcon={<Droplet size={18} />}>
              Arroser
            </Button>
          </ExampleCard>
          <ExampleCard label="secondary · md">
            <Button variant="secondary" onClick={noop}>
              Voir le détail
            </Button>
          </ExampleCard>
          <ExampleCard label="ghost · md">
            <Button variant="ghost" onClick={noop}>
              Annuler
            </Button>
          </ExampleCard>
          <ExampleCard label="cta · lg">
            <Button variant="cta" size="lg" onClick={noop} leadingIcon={<Droplet size={20} />}>
              Arroser maintenant
            </Button>
          </ExampleCard>
          <ExampleCard label="cta · sm">
            <Button variant="cta" size="sm" onClick={noop}>
              Action courte
            </Button>
          </ExampleCard>
          <ExampleCard label="cta · disabled">
            <Button variant="cta" disabled onClick={noop}>
              Désactivé
            </Button>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Buttons icône" description="Cible 44×44 (md) — respect Fitts's Law.">
        <ExampleGrid cols={4}>
          <ExampleCard label="icon · md · Plus">
            <Button variant="icon" onClick={noop} aria-label="Ajouter une plante">
              <Plus size={20} />
            </Button>
          </ExampleCard>
          <ExampleCard label="icon · md · Camera">
            <Button variant="icon" onClick={noop} aria-label="Prendre une photo">
              <Camera size={20} />
            </Button>
          </ExampleCard>
          <ExampleCard label="icon · sm · ArrowLeft">
            <Button variant="icon" size="sm" onClick={noop} aria-label="Retour">
              <ArrowLeft size={18} />
            </Button>
          </ExampleCard>
          <ExampleCard label="icon · lg · Droplet">
            <Button variant="icon" size="lg" onClick={noop} aria-label="Arroser">
              <Droplet size={22} />
            </Button>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section
        title="WaterCTA — composant signature"
        description="Orchestration peak-end : tap → spinner → burst de gouttelettes → checkmark. Auto-revert après 2s. Anim totale ≤ 1.2s."
      >
        <ExampleGrid cols={2}>
          <ExampleCard label="size: large (peak moment)">
            <WaterCTA onWater={fakeWater} />
          </ExampleCard>
          <ExampleCard label="size: inline (en liste)">
            <WaterCTA size="inline" onWater={fakeWater} label="Arroser" />
          </ExampleCard>
        </ExampleGrid>
      </Section>
    </>
  );
}
