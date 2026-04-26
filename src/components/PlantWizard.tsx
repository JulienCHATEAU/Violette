"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { PlantCreateInput } from "@/lib/zod-schemas";
import {
  TextInput,
  TextArea,
  NumberStepper,
  SegmentedControl,
} from "@/design-system/components/Input";
import { Button } from "@/design-system/components/Button";
import { H1, Italic, Label } from "@/design-system/components/Typography";
import { BotanicalLeaf } from "@/design-system/decorations/BotanicalLeaf";
import { ArrowLeft, Cloud, Droplet, Leaf, Sun } from "@/design-system/icons";
import { PhotoUploadDropzone } from "./PhotoUploadDropzone";
import { cn } from "@/design-system/lib/cn";

type SunlightValue = NonNullable<PlantCreateInput["sunlightExposure"]>;
type HumidityValue = NonNullable<PlantCreateInput["humidity"]>;

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

type WizardValues = {
  name: string;
  species: string;
  wateringFrequencyDays: number;
  sunlightExposure: SunlightValue;
  humidity: HumidityValue;
  temperature: number | null;
  description: string;
  notes: string;
};

const DEFAULT_VALUES: WizardValues = {
  name: "",
  species: "",
  wateringFrequencyDays: 7,
  sunlightExposure: "indirect_light",
  humidity: "medium",
  temperature: null,
  description: "",
  notes: "",
};

/**
 * PlantWizard — two-step onboarding for a new plant, faithful to mockup A.
 *
 * Step 1 captures the essentials (photo, name, species, watering frequency,
 * light). Step 2 adds the ambient preferences and free-form notes. The final
 * submit creates the plant, then uploads the compressed photo if any.
 *
 * Laws of UX:
 *  - Hick's Law: each step holds ≤ 4 decisions, scanned at a glance.
 *  - Peak-End Rule (lite): personalised copy on each step + a celebratory CTA
 *    label on the final step.
 *  - Doherty: useTransition is overkill here; we manage `pending` ourselves so
 *    we can chain the create + photo upload.
 */
export function PlantWizard() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<WizardValues>(DEFAULT_VALUES);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof WizardValues>(k: K, v: WizardValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const goNext = () => {
    setError(null);
    if (!values.name.trim()) {
      setError("Le petit nom est obligatoire pour aller plus loin.");
      return;
    }
    setStep(2);
  };

  const goBack = () => {
    setError(null);
    setStep(1);
  };

  const onSubmit = async () => {
    setError(null);
    setPending(true);
    try {
      // Step 1: create the plant.
      const payload = {
        name: values.name.trim(),
        species: values.species.trim() || null,
        wateringFrequencyDays: values.wateringFrequencyDays,
        sunlightExposure: values.sunlightExposure,
        humidity: values.humidity,
        temperature: values.temperature,
        description: values.description.trim() || null,
        notes: values.notes.trim() || null,
      };
      const createRes = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!createRes.ok) {
        const { error: code } = (await createRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(code === "plant_limit_reached" ? "Limite de 20 plantes atteinte." : "Création impossible.");
      }
      const { plant } = (await createRes.json()) as { plant: { id: string } };

      // Step 2: upload the photo (best-effort — if it fails the plant still exists).
      if (photoBlob) {
        const form = new FormData();
        form.append("file", new File([photoBlob], "photo.jpg", { type: "image/jpeg" }));
        const upRes = await fetch(`/api/plants/${plant.id}/photo`, { method: "POST", body: form });
        if (!upRes.ok) {
          // Soft failure: navigate to the plant anyway, the user can retry from edit.
          console.warn("Photo upload failed, plant created without photo.");
        }
      }

      router.push(`/plants/${plant.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  };

  const slide = (direction: 1 | -1) => ({
    initial: prefersReduced ? false : { opacity: 0, x: direction * 40 },
    animate: { opacity: 1, x: 0 },
    exit: prefersReduced ? undefined : { opacity: 0, x: -direction * 40 },
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  });

  return (
    <div className="space-y-6 pb-32">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <BackButton step={step} onBack={goBack} />
        <p className="text-[11px] uppercase tracking-[.25em] text-ink-400 font-semibold">
          Étape {step} · 2
        </p>
        <div className="w-11" aria-hidden="true" />
      </div>

      {/* Title block + steps */}
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div key="step1" {...slide(1)} className="space-y-6">
            <Step1Header />
            <PhotoUploadDropzone value={photoBlob} onChange={setPhotoBlob} />
            <FormSection>
              <Field id="name" label="Petit nom">
                <TextInput
                  id="name"
                  placeholder="Mona, Pilou, Sergio…"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  invalid={!!error && !values.name.trim()}
                  required
                />
              </Field>
              <Field id="species" label="Espèce">
                <TextInput
                  id="species"
                  placeholder="Monstera deliciosa"
                  value={values.species}
                  onChange={(e) => set("species", e.target.value)}
                />
              </Field>
              <Field id="freq" label="Arrosage tous les">
                <div className="flex justify-center pt-1">
                  <NumberStepper
                    label="Jours entre arrosages"
                    value={values.wateringFrequencyDays}
                    onChange={(n) => set("wateringFrequencyDays", n)}
                    min={1}
                    max={365}
                    unit="jours"
                  />
                </div>
              </Field>
              <Field id="sun" label="Lumière qu'elle reçoit">
                <SegmentedControl<SunlightValue>
                  ariaLabel="Exposition lumineuse"
                  value={values.sunlightExposure}
                  onChange={(v) => set("sunlightExposure", v)}
                  options={SUNLIGHT_OPTIONS}
                  orientation="vertical"
                />
              </Field>
            </FormSection>
          </motion.div>
        ) : (
          <motion.div key="step2" {...slide(1)} className="space-y-6">
            <Step2Header name={values.name.trim() || "ta plante"} />
            <FormSection>
              <Field id="hum" label="Humidité préférée">
                <SegmentedControl<HumidityValue>
                  ariaLabel="Humidité préférée"
                  value={values.humidity}
                  onChange={(v) => set("humidity", v)}
                  options={HUMIDITY_OPTIONS}
                  fullWidth
                />
              </Field>
              <Field id="temp" label="Température idéale">
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
              <Field id="description" label="Description">
                <TextArea
                  id="description"
                  rows={3}
                  placeholder="Une feuille fendue, ramenée d'Italie…"
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field id="notes" label="Notes personnelles">
                <TextArea
                  id="notes"
                  rows={3}
                  placeholder="Aime être tournée vers la lumière le mardi…"
                  value={values.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </Field>
            </FormSection>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <p role="alert" className="font-sans text-sm text-terracotta-600 px-1">
          {error}
        </p>
      ) : null}

      {/* Sticky CTA */}
      <StickyCta>
        {step === 1 ? (
          <Button variant="cta" size="lg" onClick={goNext} className="w-full">
            Continuer →
          </Button>
        ) : (
          <Button variant="cta" size="lg" onClick={onSubmit} disabled={pending} className="w-full">
            {pending ? "Création…" : "Créer ma plante 🌿"}
          </Button>
        )}
      </StickyCta>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function BackButton({ step, onBack }: { step: 1 | 2; onBack: () => void }) {
  if (step === 2) {
    return (
      <button
        type="button"
        onClick={onBack}
        aria-label="Retour à l'étape précédente"
        className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
      >
        <ArrowLeft size={20} />
      </button>
    );
  }
  return (
    <Link
      href="/plants"
      aria-label="Retour à la liste"
      className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
    >
      <ArrowLeft size={20} />
    </Link>
  );
}

function Step1Header() {
  return (
    <header className="relative">
      <BotanicalLeaf
        size={84}
        className="absolute -top-3 right-2 text-terracotta-500 opacity-30 z-0"
      />
      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-[.25em] text-terracotta-600 font-semibold">Bienvenue</p>
        <H1 className="text-3xl mt-1 leading-tight">
          Une nouvelle
          <br />
          colocataire ?
        </H1>
        <p className="mt-2 font-sans text-sm text-ink-600">On commence par lui faire un portrait.</p>
      </div>
    </header>
  );
}

function Step2Header({ name }: { name: string }) {
  return (
    <header className="relative">
      <BotanicalLeaf
        size={84}
        className="absolute -top-3 right-2 text-moss-500 opacity-30 z-0"
      />
      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-[.25em] text-moss-600 font-semibold">Presque fini</p>
        <H1 className="text-3xl mt-1 leading-tight">Ses préférences</H1>
        <p className="mt-2 font-serif italic text-ink-600 text-base">
          <Italic className="text-ink-600">Quelques détails pour bien prendre soin de {name}.</Italic>
        </p>
      </div>
    </header>
  );
}

function FormSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block px-1">
        <Label>{label}</Label>
      </label>
      {children}
    </div>
  );
}

function StickyCta({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-30 px-6 pt-3 pb-6 safe-bottom",
        // Pin just above the bottom Nav pill (which sits at bottom with px-5 pb-6 pt-2 + ~80px height).
        "bottom-[88px]",
      )}
      style={{
        background: "linear-gradient(to top, #FAF6EC 65%, rgba(250,246,236,0))",
      }}
    >
      <div className="max-w-xl mx-auto">{children}</div>
    </div>
  );
}

