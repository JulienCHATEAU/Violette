import Link from "next/link";
import type { Plant } from "@prisma/client";
import { Leaf } from "lucide-react";
import { computeWatering, statusColor, statusLabel } from "@/lib/watering";

export function PlantCard({ plant }: { plant: Pick<Plant, "id" | "name" | "nickname" | "lastWateredAt" | "wateringFrequencyDays" | "photoMime" | "updatedAt"> }) {
  const w = computeWatering(plant.lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;
  const photoUrl = plant.photoMime ? `/api/plants/${plant.id}/photo?v=${plant.updatedAt.getTime()}` : null;

  return (
    <Link
      href={`/plants/${plant.id}`}
      className="group block rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 overflow-hidden shadow-soft hover:shadow-lift transition"
    >
      <div className="aspect-[4/3] bg-sage-50 dark:bg-sage-900/20 relative">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-sage-400" aria-hidden>
            <Leaf size={42} strokeWidth={1.4} />
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full border ${statusColor(w.status)}`}
        >
          {statusLabel(w.status)}
        </span>
      </div>
      <div className="p-3.5">
        <div className="font-semibold leading-tight">{title}</div>
        {plant.nickname && plant.name !== plant.nickname && (
          <div className="text-xs text-zinc-500 truncate">{plant.name}</div>
        )}
        <div className="text-xs text-zinc-500 mt-1.5">
          {w.status === "overdue" && `En retard de ${Math.abs(w.diffDays)}j`}
          {w.status === "due" && `À arroser aujourd'hui`}
          {w.status === "soon" && `À arroser demain`}
          {w.status === "ok" && `Prochain arrosage dans ${w.diffDays}j`}
        </div>
      </div>
    </Link>
  );
}
