import Link from "next/link";
import type { Plant } from "@prisma/client";
import { computeWatering, statusColor, statusLabel } from "@/lib/watering";

export function PlantCard({ plant }: { plant: Plant }) {
  const w = computeWatering(plant.lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;

  return (
    <Link
      href={`/plants/${plant.id}`}
      className="group block rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-leaf-50 dark:bg-leaf-900/20 relative">
        {plant.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plant.photoUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-5xl" aria-hidden>
            🌿
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full border ${statusColor(w.status)}`}
        >
          {statusLabel(w.status)}
        </span>
      </div>
      <div className="p-3">
        <div className="font-semibold">{title}</div>
        {plant.nickname && plant.name !== plant.nickname && (
          <div className="text-xs text-zinc-500 truncate">{plant.name}</div>
        )}
        <div className="text-xs text-zinc-500 mt-1">
          {w.status === "overdue" && `En retard de ${Math.abs(w.diffDays)}j`}
          {w.status === "due" && `À arroser aujourd'hui`}
          {w.status === "soon" && `À arroser demain`}
          {w.status === "ok" && `Prochain arrosage dans ${w.diffDays}j`}
        </div>
      </div>
    </Link>
  );
}
