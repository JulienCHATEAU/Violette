"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PlantCreateInput } from "@/lib/zod-schemas";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { ConfirmDialog } from "@/design-system/components/Dialog";
import {
  TextInput,
  TextArea,
  NumberStepper,
  SegmentedControl,
} from "@/design-system/components/Input";
import { H3, Label } from "@/design-system/components/Typography";
import { Cloud, Droplet, Leaf, Sun, Trash } from "@/design-system/icons";

type Mode = "create" | "edit";

export type PlantFormValues = Partial<PlantCreateInput>;

type SunlightValue = NonNullable<PlantFormValues["sunlightExposure"]>;
type HumidityValue = NonNullable<PlantFormValues["humidity"]>;

const SUNLIGHT_OPTIONS = [
  { value: "full_sun" as SunlightValue, label: "Soleil", icon: <Sun size={14} /> },
  { value: "partial_shade" as SunlightValue, label: "Mi-ombre", icon: <Cloud size={14} /> },
  { value: "shade" as SunlightValue, label: "Ombre", icon: <Cloud size={14} /> },
  { value: "indirect_light" as SunlightValue, label: "Indirecte", icon: <Leaf size={14} /> },
];

const HUMIDITY_OPTIONS = [
  { value: "low" as HumidityValue, label: "Faible", icon: <Cloud size={14} /> },
  { value: "medium" as HumidityValue, label: "Moyenne", icon: <Droplet size={14} /> },
  { value: "high" as HumidityValue, label: "Élevée", icon: <Droplet size={14} /> },
];

/**
 * PlantForm — shared create/edit form.
 *
 * Laws of UX:
 *  - Miller's Law: 3 sections (Identité / Soins / Notes) keep the field count under
 *    the 7±2 chunk limit.
 *  - Law of Common Region: a single Card frames the form; thin inner separators
 *    cluster fields by purpose without fragmenting the visual block.
 *  - Aesthetic-Usability Effect: organic radii, paper texture, shake-on-error.
 *  - Doherty Threshold: useTransition gives instant pending feedback.
 *
 * Business logic preserved from v2.x:
 *  - Client-side requirement on `name` (trimmed).
 *  - POST /api/plants on create, PATCH /api/plants/{id} on edit.
 *  - DELETE /api/plants/{id} when removing (now confirmed via DS dialog).
 */
export function PlantForm({
  mode,
  initial,
  plantId,
  formId,
  hideSubmitButtons = false,
  onPendingChange,
}: {
  mode: Mode;
  initial?: PlantFormValues;
  plantId?: string;
  /** Stable id assigned to the underlying <form>, so a sticky CTA elsewhere can submit via `<button form={formId}>`. */
  formId?: string;
  /** Hide the Annuler / Créer-Modifier row (and the Supprimer button stays inside). The parent renders its own sticky CTA. */
  hideSubmitButtons?: boolean;
  /** Notified whenever the form's pending state changes — lets a sticky CTA reflect Enregistrement…. */
  onPendingChange?: (pending: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errorSeq, setErrorSeq] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  const [values, setValues] = useState<PlantFormValues>({
    name: "",
    nickname: "",
    species: "",
    description: "",
    wateringFrequencyDays: 7,
    sunlightExposure: "indirect_light",
    humidity: "medium",
    temperature: null,
    notes: "",
    ...initial,
  });

  const set = <K extends keyof PlantFormValues>(k: K, v: PlantFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const fail = (message: string) => {
    setError(message);
    setErrorSeq((n) => n + 1);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.name?.trim()) {
      fail("Le nom est obligatoire.");
      return;
    }
    start(async () => {
      const url = mode === "create" ? "/api/plants" : `/api/plants/${plantId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        fail("Erreur lors de l'enregistrement.");
        return;
      }
      const { plant } = (await res.json()) as { plant: { id: string } };
      router.push(`/plants/${plant.id}`);
      router.refresh();
    });
  };

  const performDelete = async (): Promise<void> => {
    if (!plantId) return;
    setConfirmDelete(false);
    start(async () => {
      const res = await fetch(`/api/plants/${plantId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/plants");
        router.refresh();
      } else {
        fail("Suppression impossible.");
      }
    });
  };

  const shake = !prefersReduced && errorSeq > 0 ? { x: [0, -6, 6, -4, 4, 0] } : undefined;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div key={errorSeq} animate={shake} transition={{ duration: 0.32 }}>
        <Card radius="organic-1" elevation="paper" padding="lg">
          <form id={formId} onSubmit={onSubmit} className="space-y-6">
            {/* Section 1 — Identity */}
            <FormSection title="Identité">
              <Field id="name" label="Nom *">
                <TextInput
                  id="name"
                  required
                  placeholder="Monstera, Ficus…"
                  value={values.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  invalid={!!error && !values.name?.trim()}
                />
              </Field>
              <Field id="nickname" label="Surnom">
                <TextInput
                  id="nickname"
                  placeholder="Gérard…"
                  value={values.nickname ?? ""}
                  onChange={(e) => set("nickname", e.target.value)}
                />
              </Field>
              <Field id="species" label="Espèce (nom scientifique)">
                <TextInput
                  id="species"
                  placeholder="Monstera deliciosa"
                  value={values.species ?? ""}
                  onChange={(e) => set("species", e.target.value)}
                />
              </Field>
            </FormSection>

            <Separator />

            {/* Section 2 — Care */}
            <FormSection title="Soins">
              <Field id="freq" label="Fréquence d'arrosage">
                <div className="flex justify-center pt-1">
                  <NumberStepper
                    label="Jours entre arrosages"
                    value={values.wateringFrequencyDays ?? 7}
                    onChange={(n) => set("wateringFrequencyDays", n)}
                    min={1}
                    max={365}
                    unit="jours"
                  />
                </div>
              </Field>
              <Field id="sun" label="Exposition">
                <SegmentedControl<SunlightValue>
                  ariaLabel="Exposition lumineuse"
                  value={(values.sunlightExposure ?? "indirect_light") as SunlightValue}
                  onChange={(v) => set("sunlightExposure", v)}
                  options={SUNLIGHT_OPTIONS}
                  orientation="vertical"
                />
              </Field>
              <Field id="hum" label="Humidité">
                <SegmentedControl<HumidityValue>
                  ariaLabel="Humidité"
                  value={(values.humidity ?? "medium") as HumidityValue}
                  onChange={(v) => set("humidity", v)}
                  options={HUMIDITY_OPTIONS}
                  orientation="vertical"
                />
              </Field>
              <Field id="temp" label="Température">
                <div className="flex justify-center pt-1">
                  <NumberStepper
                    label="Température en °C"
                    value={values.temperature ?? 22}
                    onChange={(n) => set("temperature", n)}
                    min={0}
                    max={50}
                    unit="°C"
                  />
                </div>
              </Field>
            </FormSection>

            <Separator />

            {/* Section 3 — Notes */}
            <FormSection title="Notes">
              <Field id="description" label="Description">
                <TextArea
                  id="description"
                  rows={3}
                  placeholder="Une feuille fendue, ramenée d'Italie…"
                  value={values.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field id="notes" label="Notes personnelles">
                <TextArea
                  id="notes"
                  rows={3}
                  placeholder="Aime être tournée vers la lumière le mardi…"
                  value={values.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </Field>
            </FormSection>

            {error ? (
              <p role="alert" className="font-sans text-sm text-terracotta-600">
                {error}
              </p>
            ) : null}

            {hideSubmitButtons ? null : (
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={pending}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="cta" size="md" disabled={pending} className="flex-1">
                  {pending ? "Enregistrement…" : mode === "create" ? "Créer" : "Modifier"}
                </Button>
              </div>
            )}

            {mode === "edit" && plantId ? (
              <div className={hideSubmitButtons ? "pt-1" : "pt-3"}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  disabled={pending}
                  leadingIcon={<Trash size={16} />}
                  className="!text-terracotta-600 hover:!bg-terracotta-50 w-full"
                >
                  Supprimer cette plante
                </Button>
              </div>
            ) : null}
          </form>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={performDelete}
        title="Supprimer cette plante ?"
        description="Cette action est irréversible. Toutes les données et l'historique d'arrosage seront perdus."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
      />
    </motion.div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <H3 className="text-base text-ink-800">{title}</H3>
      {children}
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block">
        <Label>{label}</Label>
      </label>
      {children}
    </div>
  );
}

function Separator() {
  return <div className="border-t border-paper-200" aria-hidden="true" />;
}
