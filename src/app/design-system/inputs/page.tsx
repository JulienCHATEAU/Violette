"use client";

import { useState } from "react";
import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { TextInput, NumberStepper, SegmentedControl } from "@/design-system/components/Input";
import { Sun, Cloud, Leaf } from "@/design-system/icons";
import { Label } from "@/design-system/components/Typography";

type Light = "low" | "indirect" | "bright";

export default function InputsPage() {
  const [text, setText] = useState("");
  const [days, setDays] = useState(7);
  const [light, setLight] = useState<Light>("indirect");

  return (
    <>
      <PageHeader
        title="Inputs"
        lead="Trois primitives : TextInput, NumberStepper, SegmentedControl. Toutes accessibles au clavier, focus ring terracotta visible."
      />

      <Section title="TextInput">
        <ExampleGrid cols={2}>
          <ExampleCard label="vide" className="!justify-stretch !block">
            <Label>Nom de la plante</Label>
            <div className="mt-2">
              <TextInput placeholder="Monstera du salon…" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          </ExampleCard>
          <ExampleCard label="invalid" className="!justify-stretch !block">
            <Label>Nom de la plante</Label>
            <div className="mt-2">
              <TextInput placeholder="Champ requis" defaultValue="" invalid />
            </div>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <Section title="NumberStepper" description="Cibles 44×44 (Fitts), valeur centrale en Fraunces 3xl.">
        <ExampleCard label="Fréquence d'arrosage">
          <NumberStepper label="Jours entre arrosages" value={days} onChange={setDays} min={1} max={30} unit="jours" />
        </ExampleCard>
      </Section>

      <Section title="SegmentedControl" description="3-5 options exclusives, sélection en terracotta.">
        <ExampleCard label="Exposition lumineuse">
          <SegmentedControl<Light>
            ariaLabel="Exposition lumineuse"
            value={light}
            onChange={setLight}
            options={[
              { value: "low", label: "Faible", icon: <Cloud size={16} /> },
              { value: "indirect", label: "Indirecte", icon: <Leaf size={16} /> },
              { value: "bright", label: "Vive", icon: <Sun size={16} /> },
            ]}
          />
        </ExampleCard>
      </Section>
    </>
  );
}
