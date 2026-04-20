"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { compressImage } from "@/lib/image";

type Props = {
  plantId: string;
  hasPhoto: boolean;
};

export function PhotoUpload({ plantId, hasPhoto }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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

  const onRemove = async () => {
    if (!confirm("Supprimer la photo ?")) return;
    setStatus("working");
    const res = await fetch(`/api/plants/${plantId}/photo`, { method: "DELETE" });
    setStatus(res.ok ? "idle" : "error");
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "working"}
        className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 px-3 py-2 text-sm font-medium bg-white dark:bg-transparent disabled:opacity-60 transition"
      >
        <Camera size={16} strokeWidth={2} />
        {status === "working" ? "Envoi…" : hasPhoto ? "Changer" : "Ajouter une photo"}
      </button>
      {hasPhoto && (
        <button
          type="button"
          onClick={onRemove}
          disabled={status === "working"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 px-3 py-2 text-sm font-medium disabled:opacity-60 transition"
        >
          <Trash2 size={16} strokeWidth={2} />
          Retirer
        </button>
      )}
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
      {status === "error" && error && (
        <p className="w-full text-sm text-rose-600" role="alert">{error}</p>
      )}
    </div>
  );
}
