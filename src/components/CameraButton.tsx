"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Camera } from "@/design-system/icons";
import { compressImage } from "@/lib/image";

/**
 * CameraButton — primary FAB nested inside the bottom Nav.
 *
 * Laws of UX:
 *  - Jakob's Law: conventional centered FAB pattern.
 *  - Fitts's Law: 64px target in the thumb arc.
 *  - Doherty Threshold: busy state shows immediately on tap; spinner masks the
 *    multi-step compress → POST → upload pipeline.
 *
 * Business logic is unchanged from v2.1: compress photo locally, create a plant,
 * upload the photo, then redirect to the edit screen.
 */
export function CameraButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

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
      <motion.button
        type="button"
        aria-label="Prendre une photo"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        whileTap={prefersReduced || busy ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute -top-7 w-16 h-16 rounded-full bg-gradient-to-b from-terracotta-500 to-terracotta-600 text-paper-50 shadow-lift ring-4 ring-paper-50 flex items-center justify-center disabled:opacity-70 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-paper-50 focus-visible:ring-offset-0"
      >
        {busy ? (
          <span
            className="h-6 w-6 rounded-full border-2 border-paper-50/60 border-t-paper-50 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Camera size={26} />
        )}
      </motion.button>
      <span className="mt-10 mb-3 font-sans text-xs text-ink-400">Photo</span>
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
          className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 bg-terracotta-600 text-paper-50 font-sans text-sm px-4 py-2 rounded-pill-organic shadow-lift"
        >
          {error}
        </p>
      )}
    </div>
  );
}
