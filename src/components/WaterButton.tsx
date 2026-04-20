"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function WaterButton({ plantId }: { plantId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  const onClick = () => {
    start(async () => {
      const res = await fetch(`/api/plants/${plantId}/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2000);
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="w-full rounded-2xl bg-leaf-600 hover:bg-leaf-700 text-white font-semibold py-4 text-lg shadow-sm disabled:opacity-60 transition"
      aria-live="polite"
    >
      {done ? "💧 Arrosée !" : pending ? "Enregistrement…" : "💧 Je viens d'arroser"}
    </button>
  );
}
