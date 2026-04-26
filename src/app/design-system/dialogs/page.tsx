"use client";

import { useState } from "react";
import { PageHeader, Section, ExampleCard, ExampleGrid } from "../Demo";
import { Button } from "@/design-system/components/Button";
import { ConfirmDialog } from "@/design-system/components/Dialog";
import { Trash } from "@/design-system/icons";

export default function DialogsPage() {
  const [destructive, setDestructive] = useState(false);
  const [neutral, setNeutral] = useState(false);

  return (
    <>
      <PageHeader
        title="Dialogs"
        lead="Modale accessible pour les confirmations destructives ou importantes. Remplace `confirm()` natif. Backdrop blur, focus trap, escape, scroll lock."
      />

      <Section title="ConfirmDialog">
        <ExampleGrid cols={2}>
          <ExampleCard label="destructive">
            <Button variant="cta" onClick={() => setDestructive(true)} leadingIcon={<Trash size={16} />}>
              Supprimer la photo
            </Button>
          </ExampleCard>
          <ExampleCard label="neutral">
            <Button variant="secondary" onClick={() => setNeutral(true)}>
              Action importante
            </Button>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      <ConfirmDialog
        open={destructive}
        onClose={() => setDestructive(false)}
        onConfirm={() => setDestructive(false)}
        title="Supprimer la photo ?"
        description="La photo actuelle sera retirée. Tu pourras toujours en ajouter une nouvelle."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
      />
      <ConfirmDialog
        open={neutral}
        onClose={() => setNeutral(false)}
        onConfirm={() => setNeutral(false)}
        title="Confirmer l'action"
        description="Cette action mettra à jour la fréquence d'arrosage de ta plante."
        confirmLabel="Confirmer"
      />
    </>
  );
}
