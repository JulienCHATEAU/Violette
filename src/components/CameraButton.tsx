"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { compressImage } from "@/lib/image";

export function CameraButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const blob = await compressImage(file);

      const createRes = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nouvelle plante" }),
      });
      if (!createRes.ok) {
        const { error } = (await createRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(error === "plant_limit_reached" ? "Limite de 20 plantes atteinte." : "Création impossible.");
      }
      const { plant } = (await createRes.json()) as { plant: { id: string } };

      const form = new FormData();
      form.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const upRes = await fetch(`/api/plants/${plant.id}/photo`, { method: "POST", body: form });
      if (!upRes.ok) throw new Error("Upload de la photo échoué.");

      router.push(`/plants/${plant.id}/edit`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        aria-label="Prendre une photo"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="absolute -top-7 w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lift ring-4 ring-white dark:ring-zinc-900 flex items-center justify-center disabled:opacity-60 transition"
      >
        {busy ? <span className="text-sm">…</span> : <Camera size={26} strokeWidth={2} />}
      </button>
      <span className="mt-10 mb-3 text-xs text-zinc-500">Photo</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = "";
        }}
      />
      {error && (
        <p
          role="alert"
          className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 bg-rose-600 text-white text-sm px-3 py-2 rounded-lg shadow-lift"
        >
          {error}
        </p>
      )}
    </div>
  );
}
