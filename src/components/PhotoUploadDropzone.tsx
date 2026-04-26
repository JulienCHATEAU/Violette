"use client";

import { useRef, useState } from "react";
import { Camera, Trash } from "@/design-system/icons";
import { Button } from "@/design-system/components/Button";
import { compressImage } from "@/lib/image";
import { cn } from "@/design-system/lib/cn";

type Props = {
  /** Currently picked + compressed photo (passed up to the parent for the eventual upload). */
  value: Blob | null;
  /** Notified with the compressed blob ready to be uploaded, or `null` to clear. */
  onChange: (blob: Blob | null) => void;
};

/**
 * PhotoUploadDropzone — large dashed card used in the new-plant wizard. Holds the
 * compressed blob in local state until the parent submits the form (upload happens
 * in a second request once the plant is created server-side).
 *
 * Distinct from `PhotoUpload` (which talks to /photo directly because it's used on
 * an existing plant in the edit screen).
 *
 * Laws of UX:
 *  - Aesthetic-Usability: dashed border, terracotta accent circle, organic radius.
 *  - Doherty: compression happens immediately so the preview shows up under 200ms
 *    on typical phone cameras.
 */
export function PhotoUploadDropzone({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useObjectUrl(value);

  const onPick = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const blob = await compressImage(file);
      onChange(blob);
    } catch {
      setError("Impossible de préparer cette photo.");
    } finally {
      setBusy(false);
    }
  };

  const onClear = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-organic-1 shadow-paper p-4 relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          "relative w-full aspect-[4/3] flex flex-col items-center justify-center gap-2.5",
          "bg-paper-50 transition-colors duration-180 ease-organic",
          "border-2 border-dashed border-paper-300 hover:border-terracotta-400",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20",
          "disabled:opacity-70",
          "overflow-hidden",
        )}
        style={{ borderRadius: "28px 36px 28px 36px" }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="w-14 h-14 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-500"
            >
              <Camera size={22} />
            </span>
            <p className="font-serif text-base text-ink-800">
              {busy ? "Préparation…" : "Prends-la en photo"}
            </p>
            <p className="font-sans text-xs text-ink-400">ou choisis depuis la galerie</p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
          e.target.value = "";
        }}
      />

      {previewUrl ? (
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            leadingIcon={<Camera size={16} />}
          >
            Changer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={busy}
            leadingIcon={<Trash size={16} />}
            className="!text-terracotta-600 hover:!bg-terracotta-50"
          >
            Retirer
          </Button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-sans text-sm text-terracotta-600 mt-3">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Tiny hook: turn a Blob into an object URL and revoke it on unmount/replacement. */
function useObjectUrl(blob: Blob | null): string | null {
  const ref = useRef<{ blob: Blob | null; url: string | null }>({ blob: null, url: null });
  if (ref.current.blob !== blob) {
    if (ref.current.url) URL.revokeObjectURL(ref.current.url);
    ref.current = { blob, url: blob ? URL.createObjectURL(blob) : null };
  }
  return ref.current.url;
}
