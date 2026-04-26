import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { H1, H2, H3, Body, Caption, Label, Italic } from "@/design-system/components/Typography";

export default function TypographyPage() {
  return (
    <>
      <PageHeader
        title="Typography"
        lead="Fraunces (serif, opsz variable) pour les titres et accents personnifiés. Plus Jakarta Sans pour le corps et l'UI. Hiérarchie volontairement contrastée."
      />

      <Section title="Headings" description="Fraunces, weight medium, kerning serré.">
        <ExampleGrid cols={1}>
          <ExampleCard label="<H1>" className="!justify-start">
            <H1>Mes plantes attendent un câlin</H1>
          </ExampleCard>
          <ExampleCard label="<H2>" className="!justify-start">
            <H2>Salon — 4 plantes</H2>
          </ExampleCard>
          <ExampleCard label="<H3>" className="!justify-start">
            <H3>Programme d'arrosage</H3>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Body & captions" description="Plus Jakarta Sans, weight 400/500.">
        <ExampleGrid cols={1}>
          <ExampleCard label="<Body>" className="!justify-start">
            <Body>Une plante d'intérieur préfère un arrosage généreux mais espacé à un goutte-à-goutte permanent.</Body>
          </ExampleCard>
          <ExampleCard label="<Caption>" className="!justify-start">
            <Caption>Dernier arrosage il y a 4 jours · prochaine échéance dans 2 jours</Caption>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Labels & italiques" description="Pour eyebrows, étiquettes de formulaire et noms scientifiques.">
        <ExampleGrid cols={2}>
          <ExampleCard label="<Label>">
            <Label>Fréquence</Label>
          </ExampleCard>
          <ExampleCard label="<Italic> — nom scientifique">
            <Italic>Monstera deliciosa</Italic>
          </ExampleCard>
        </ExampleGrid>
      </Section>
    </>
  );
}
