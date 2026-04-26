import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { Card } from "@/design-system/components/Card";
import { H3, Body, Caption } from "@/design-system/components/Typography";

export default function CardsPage() {
  return (
    <>
      <PageHeader
        title="Cards"
        lead="Conteneur générique. Quatre formes organiques au choix, trois élévations papier, padding configurable, texture optionnelle."
      />

      <Section title="Radii organiques">
        <ExampleGrid cols={4}>
          {(["organic-1", "organic-2", "organic-3", "pill-organic"] as const).map((r) => (
            <ExampleCard key={r} label={r}>
              <Card radius={r} elevation="paper" padding="md" className="w-32 text-center">
                <Caption>{r}</Caption>
              </Card>
            </ExampleCard>
          ))}
        </ExampleGrid>
      </Section>

      <Section title="Élévations">
        <ExampleGrid cols={3}>
          <ExampleCard label="elevation: flat">
            <Card elevation="flat" radius="organic-2" className="w-44">
              <Caption>Plate, juste un border.</Caption>
            </Card>
          </ExampleCard>
          <ExampleCard label="elevation: paper">
            <Card elevation="paper" radius="organic-2" className="w-44">
              <Caption>Ombre papier discrète.</Caption>
            </Card>
          </ExampleCard>
          <ExampleCard label="elevation: lift">
            <Card elevation="lift" radius="organic-2" className="w-44">
              <Caption>Ombre marquée — éléments survolés.</Caption>
            </Card>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Composition réaliste" description="Texture papier + radius organic-1 + élévation paper.">
        <Card radius="organic-1" elevation="paper" padding="lg" textured className="max-w-md">
          <H3>Monstera du salon</H3>
          <Body className="mt-2">Arrosage tous les 7 jours, lumière vive indirecte. Vaporisation hebdomadaire.</Body>
          <Caption className="mt-3">Dernière action il y a 4 jours.</Caption>
        </Card>
      </Section>
    </>
  );
}
