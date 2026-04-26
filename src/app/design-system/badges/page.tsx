import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { Badge } from "@/design-system/components/Badge";
import { Droplet, Sparkles, Clock } from "@/design-system/icons";

export default function BadgesPage() {
  return (
    <>
      <PageHeader
        title="Badges"
        lead="Pastilles courtes pour communiquer un statut. urgent (terracotta) — Von Restorff Effect : à réserver aux signaux les plus prioritaires."
      />

      <Section title="Variants">
        <ExampleGrid cols={4}>
          <ExampleCard label="urgent">
            <Badge variant="urgent" icon={<Droplet size={12} />}>
              À arroser
            </Badge>
          </ExampleCard>
          <ExampleCard label="soon">
            <Badge variant="soon" icon={<Clock size={12} />}>
              Bientôt
            </Badge>
          </ExampleCard>
          <ExampleCard label="ok">
            <Badge variant="ok" icon={<Sparkles size={12} />}>
              Heureuse
            </Badge>
          </ExampleCard>
          <ExampleCard label="info">
            <Badge variant="info">Salon</Badge>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="Sans icône">
        <ExampleGrid cols={4}>
          <ExampleCard label="urgent">
            <Badge variant="urgent">3 jours</Badge>
          </ExampleCard>
          <ExampleCard label="soon">
            <Badge variant="soon">2 j.</Badge>
          </ExampleCard>
          <ExampleCard label="ok">
            <Badge variant="ok">+5 j.</Badge>
          </ExampleCard>
          <ExampleCard label="info">
            <Badge variant="info">Bureau</Badge>
          </ExampleCard>
        </ExampleGrid>
      </Section>
    </>
  );
}
