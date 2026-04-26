"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/image";
import { Button } from "@/design-system/components/Button";
import { ConfirmDialog } from "@/design-system/components/Dialog";
import { Camera, Trash } from "@/design-system/icons";

type Props = {
  plantId: string;
  hasPhoto: boolean;
};

/**
 * PhotoUpload — adds, replaces or removes the plant photo.
 *
 * Business logic preserved from v2.x: client-side compression then a single POST
 * to `/api/plants/{id}/photo`, or a DELETE for removal. The native `confirm()`
 * has been replaced with a DS `ConfirmDialog` for a consistent, animated, focus-
 * trapped confirmation flow.
 */
export function PhotoUpload({ plantId, hasPhoto }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onFile = async (file: File) => {
    setError(null);
    setStatus("working");
    try {
      const blob = await compressImage(file);
      const form = new FormData();
      form.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const res = await fetch(`/api/plants/${plantId}/photo`, { method: "POST", body: form });
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(error ?? "upload_failed");
      }
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  };

  const performRemove = async (): Promise<void> => {
    setConfirmOpen(false);
    setStatus("working");
    const res = await fetch(`/api/plants/${plantId}/photo`, { method: "DELETE" });
    setStatus(res.ok ? "idle" : "error");
    if (res.ok) router.refresh();
  };

  const working = status === "working";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={working}
        leadingIcon={<Camera size={16} />}
      >
        {working ? "Envoi…" : hasPhoto ? "Changer" : "Ajouter une photo"}
      </Button>
      {hasPhoto ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={working}
          leadingIcon={<Trash size={16} />}
          className="!text-terracotta-600 hover:!bg-terracotta-50"
        >
          Retirer
        </Button>
      ) : null}
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
      {status === "error" && error ? (
        <p className="w-full font-sans text-sm text-terracotta-600" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={performRemove}
        title="Supprimer la photo ?"
        description="La photo actuelle sera retirée. Tu pourras toujours en ajouter une nouvelle."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
      />
    </div>
  );
}
