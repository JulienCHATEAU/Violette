"use client";

import { useState } from "react";
import Link from "next/link";
import { PlantForm, type PlantFormValues } from "@/components/PlantForm";
import { Button } from "@/design-system/components/Button";

const FORM_ID = "plant-edit-form";

type Props = {
  plantId: string;
  initial: PlantFormValues;
};

/**
 * Client wrapper around `<PlantForm mode="edit">` that hides the form's own
 * submit row and renders a sticky bottom CTA instead — matching the wizard
 * pattern from the create flow.
 *
 * The submit button is plain HTML (`<button form={FORM_ID} type="submit">`)
 * so the sticky CTA outside the form still triggers `<form onSubmit>`. Pending
 * state bubbles up via `onPendingChange` so the CTA label can switch to
 * "Enregistrement…" without re-implementing the network code.
 */
export function EditPlantPanel({ plantId, initial }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <>
      <PlantForm
        mode="edit"
        plantId={plantId}
        initial={initial}
        formId={FORM_ID}
        hideSubmitButtons
        onPendingChange={setPending}
      />

      {/* Sticky bottom CTA — pinned just above the floating Nav pill */}
      <div
        className="fixed left-0 right-0 z-30 px-6 pt-3 pb-6 safe-bottom bottom-[88px]"
        style={{
          background: "linear-gradient(to top, #FAF6EC 65%, rgba(250,246,236,0))",
        }}
      >
        <div className="max-w-xl mx-auto flex gap-3">
          <Link href={`/plants/${plantId}`} className="flex-1">
            <Button type="button" variant="ghost" size="lg" className="w-full" disabled={pending}>
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            form={FORM_ID}
            variant="cta"
            size="lg"
            disabled={pending}
            className="flex-1"
          >
            {pending ? "Enregistrement…" : "Modifier"}
          </Button>
        </div>
      </div>
    </>
  );
}
