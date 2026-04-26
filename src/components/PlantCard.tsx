"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Plant } from "@prisma/client";
import { computeWatering, type WateringStatus } from "@/lib/watering";
import { pickMessage } from "@/lib/personification/select";
import type { PersonificationMessage } from "@/lib/personification/types";
import { Card } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import { PlantBubble, type BubblePosition } from "@/design-system/components/PlantBubble";
import { Leaf } from "@/design-system/icons";
import { cn } from "@/design-system/lib/cn";

export type PlantCardData = Pick<
  Plant,
  "id" | "name" | "nickname" | "lastWateredAt" | "wateringFrequencyDays" | "photoMime" | "updatedAt"
>;

type Props = {
  plant: PlantCardData;
  /** Index inside the list, used for staggered entry. */
  index?: number;
  /** Whether this card is allowed to render a personification bubble. The parent caps slots at ~30% of visible cards. */
  bubbleSlot?: boolean;
};

const BUBBLE_POSITIONS: ReadonlyArray<BubblePosition> = ["top-right", "top-left", "bottom-right", "bottom-left"];

const STATUS_TO_BADGE: Record<WateringStatus, "urgent" | "soon" | "ok"> = {
  overdue: "urgent",
  due: "urgent",
  soon: "soon",
  ok: "ok",
};

const STATUS_LABEL: Record<WateringStatus, string> = {
  overdue: "En retard",
  due: "Aujourd'hui",
  soon: "Demain",
  ok: "OK",
};

function statusDescription(status: WateringStatus, diffDays: number): string {
  switch (status) {
    case "overdue":
      return `En retard de ${Math.abs(diffDays)}j`;
    case "due":
      return "À arroser aujourd'hui";
    case "soon":
      return "À arroser demain";
    case "ok":
      return `Prochain arrosage dans ${diffDays}j`;
  }
}

/**
 * PlantCard — single plant tile shown in lists.
 *
 * Laws of UX:
 *  - Law of Common Region: each plant is one organic-radius card.
 *  - Law of Proximity: photo, name, status and optional voice bubble are bundled.
 *  - Aesthetic-Usability Effect: organic radius, paper shadow, tap micro-feedback,
 *    occasional speech bubble.
 *
 * Personification:
 *  - Runs `pickMessage` once at mount when `bubbleSlot` is true.
 *  - The decision is deterministic per (plant.id, UTC date), so re-renders or
 *    navigations within the same day always land on the same message.
 */
export function PlantCard({ plant, index = 0, bubbleSlot = false }: Props) {
  const prefersReduced = useReducedMotion();
  const lastWateredAt = useMemo(() => new Date(plant.lastWateredAt), [plant.lastWateredAt]);
  const updatedAtMs = useMemo(() => new Date(plant.updatedAt).getTime(), [plant.updatedAt]);
  const watering = computeWatering(lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;
  const photoUrl = plant.photoMime ? `/api/plants/${plant.id}/photo?v=${updatedAtMs}` : null;

  // Resolve the bubble client-side at mount only — never on server (avoids hydration drift).
  const [bubble, setBubble] = useState<{ message: PersonificationMessage; position: BubblePosition } | null>(null);
  useEffect(() => {
    if (!bubbleSlot) return;
    const message = pickMessage(
      { id: plant.id, lastWateredAt, wateringFrequencyDays: plant.wateringFrequencyDays },
      new Date(),
    );
    if (!message) return;
    // Position chosen deterministically from plant.id so it doesn't jump on re-mount.
    const positionIdx = positionIndex(plant.id) % BUBBLE_POSITIONS.length;
    setBubble({ message, position: BUBBLE_POSITIONS[positionIdx]! });
  }, [bubbleSlot, plant.id, plant.wateringFrequencyDays, lastWateredAt]);

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: prefersReduced ? 0 : index * 0.06 }}
    >
      <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
        <Link href={`/plants/${plant.id}`} className="block">
          <Card radius="organic-1" elevation="paper" padding="none" className="overflow-hidden">
            <div className={cn("relative aspect-[4/3]", photoUrl ? "bg-paper-100" : "bg-paper-100 paper-grain")}>
              {photoUrl ? (
                // next/image is intentionally avoided here — same-origin Buffer route
                // would need a custom loader. Native lazy-loading is enough at family scale.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-moss-400" aria-hidden="true">
                  <Leaf size={42} />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant={STATUS_TO_BADGE[watering.status]}>{STATUS_LABEL[watering.status]}</Badge>
              </div>
              {bubble ? (
                <PlantBubble size="sm" position={bubble.position} message={bubble.message.text} />
              ) : null}
            </div>
            <div className="p-3.5">
              <h3 className="font-serif text-lg leading-tight text-ink-800 truncate">{title}</h3>
              {plant.nickname && plant.name !== plant.nickname ? (
                <p className="font-serif italic text-xs text-ink-400 truncate">{plant.name}</p>
              ) : null}
              <p className="mt-1.5 font-sans text-xs text-ink-600">{statusDescription(watering.status, watering.diffDays)}</p>
            </div>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/** Stable index derived from plant.id, used only to spread bubble positions across cards. */
function positionIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
