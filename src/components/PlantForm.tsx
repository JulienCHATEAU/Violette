"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PlantCreateInput } from "@/lib/zod-schemas";

type Mode = "create" | "edit";

export type PlantFormValues = Partial<PlantCreateInput>;

export function PlantForm({
  mode,
  initial,
  plantId,
}: {
  mode: Mode;
  initial?: PlantFormValues;
  plantId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<PlantFormValues>({
    name: "",
    nickname: "",
    species: "",
    description: "",
    wateringFrequencyDays: 7,
    sunlightExposure: "indirect_light",
    humidity: "medium",
    temperatureRange: "",
    notes: "",
    ...initial,
  });

  const set = <K extends keyof PlantFormValues>(k: K, v: PlantFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.name?.trim()) {
      setError("Le nom est obligatoire.");
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
        setError("Erreur lors de l'enregistrement.");
        return;
      }
      const { plant } = (await res.json()) as { plant: { id: string } };
      router.push(`/plants/${plant.id}`);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!plantId) return;
    if (!confirm("Supprimer cette plante ? Cette action est irréversible.")) return;
    start(async () => {
      const res = await fetch(`/api/plants/${plantId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/plants");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">Nom *</label>
        <input
          id="name"
          required
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.name ?? ""}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="nickname">Surnom</label>
        <input
          id="nickname"
          placeholder="Gérard…"
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.nickname ?? ""}
          onChange={(e) => set("nickname", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="species">Espèce (nom scientifique)</label>
        <input
          id="species"
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.species ?? ""}
          onChange={(e) => set("species", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="freq">
          Fréquence d'arrosage (jours)
        </label>
        <input
          id="freq"
          type="number"
          min={1}
          max={365}
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.wateringFrequencyDays ?? 7}
          onChange={(e) => set("wateringFrequencyDays", Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="sun">Exposition</label>
          <select
            id="sun"
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
            value={values.sunlightExposure ?? "indirect_light"}
            onChange={(e) => set("sunlightExposure", e.target.value as PlantFormValues["sunlightExposure"])}
          >
            <option value="full_sun">Plein soleil</option>
            <option value="partial_shade">Mi-ombre</option>
            <option value="shade">Ombre</option>
            <option value="indirect_light">Lumière indirecte</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="hum">Humidité</label>
          <select
            id="hum"
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
            value={values.humidity ?? "medium"}
            onChange={(e) => set("humidity", e.target.value as PlantFormValues["humidity"])}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="temp">Température</label>
        <input
          id="temp"
          placeholder="18-25°C"
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.temperatureRange ?? ""}
          onChange={(e) => set("temperatureRange", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border px-4 py-3 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-3 disabled:opacity-60 shadow-soft transition"
        >
          {pending ? "Enregistrement…" : mode === "create" ? "Créer" : "Mettre à jour"}
        </button>
      </div>

      {mode === "edit" && plantId && (
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="w-full rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 py-3 font-medium mt-4 transition"
        >
          Supprimer cette plante
        </button>
      )}
    </form>
  );
}
