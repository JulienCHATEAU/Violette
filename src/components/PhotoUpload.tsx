"use client";
import { useRef, useState } from "react";
import type { RecognitionSuggestion } from "@/lib/zod-schemas";

type Props = {
  onRecognized: (payload: {
    url: string;
    suggestion: RecognitionSuggestion | null;
    source: "plant-id" | "claude-vision" | "none";
  }) => void;
};

export function PhotoUpload({ onRecognized }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "recognizing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setStatus("uploading");

    // 1) Upload to storage
    const form = new FormData();
    form.append("file", file);
    const upRes = await fetch("/api/upload", { method: "POST", body: form });
    if (!upRes.ok) {
      setStatus("error");
      setError("Échec de l'upload de la photo.");
      return;
    }
    const { url } = (await upRes.json()) as { url: string };

    // 2) Base64 for recognition
    setStatus("recognizing");
    const b64 = await fileToBase64(file);

    try {
      const recRes = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64 }),
      });
      const data = (await recRes.json()) as {
        suggestions: RecognitionSuggestion[];
        source: "plant-id" | "claude-vision" | "none";
      };
      const top = data.suggestions[0] ?? null;
      onRecognized({ url, suggestion: top, source: data.source });
      setStatus("done");
    } catch {
      // Recognition failed but we still have the URL → manual mode
      onRecognized({ url, suggestion: null, source: "none" });
      setStatus("done");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-xl border border-leaf-600 text-leaf-700 py-3 font-medium bg-white dark:bg-transparent"
        >
          📷 Photo
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {preview && (
        <div className="rounded-xl overflow-hidden border bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="w-full max-h-72 object-contain" />
        </div>
      )}

      {status === "uploading" && <p className="text-sm text-zinc-500">Upload en cours…</p>}
      {status === "recognizing" && <p className="text-sm text-zinc-500">⏳ Reconnaissance en cours…</p>}
      {status === "error" && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
