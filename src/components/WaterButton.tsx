"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Droplet } from "lucide-react";

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
      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold py-4 text-lg shadow-soft disabled:opacity-60 transition"
      aria-live="polite"
    >
      <Droplet size={22} strokeWidth={2} />
      {done ? "Arrosée !" : pending ? "Enregistrement…" : "Je viens d'arroser"}
    </button>
  );
}
