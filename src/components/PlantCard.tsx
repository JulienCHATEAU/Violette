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
import { Droplet, Leaf } from "@/design-system/icons";
import { cn } from "@/design-system/lib/cn";
import { QuickWaterButton } from "./QuickWaterButton";

export type PlantCardData = Pick<
  Plant,
  "id" | "name" | "nickname" | "species" | "lastWateredAt" | "wateringFrequencyDays" | "photoMime" | "updatedAt"
>;

export type PlantCardVariant = "standard" | "urgent" | "compact";

type Props = {
  plant: PlantCardData;
  /** `standard` (default) — generic 4/3 grid card.
   *  `urgent`            — horizontal layout for the dashboard "À arroser" section.
   *  `compact`           — small portrait card for the dashboard "Cette semaine" section. */
  variant?: PlantCardVariant;
  /** Index inside the list, used for staggered entry and auto-rotating organic radii. */
  index?: number;
  /** Whether this card is allowed to render a personification bubble. The parent caps slots at ~30% of visible cards. */
  bubbleSlot?: boolean;
  /** Show the inline quick-water button (urgent variant only). When the API succeeds the parent receives a callback. */
  showQuickWater?: boolean;
  /** Notified once a quick-water mutation succeeded. The parent typically removes the card with an exit animation. */
  onWatered?: (plantId: string) => void;
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

const ORGANIC_RADII = ["organic-1", "organic-2", "organic-3"] as const;

function statusDescription(status: WateringStatus, diffDays: number): string {
  switch (status) {
    case "overdue":
      return `Soif depuis ${Math.abs(diffDays)}j`;
    case "due":
      return "À arroser ce soir";
    case "soon":
      return "À arroser demain";
    case "ok":
      return diffDays <= 1 ? "demain" : `dans ${diffDays} j`;
  }
}

/**
 * PlantCard — single plant tile shown in lists.
 *
 * Three layouts share the same data and animation skeleton:
 *  - `standard` keeps the original 4/3 grid card (used by the plants list).
 *  - `urgent`   renders a horizontal hero card with optional pulsing droplet and
 *               quick-water inline action.
 *  - `compact`  renders a small 4/5 portrait card for the dashboard "Cette
 *               semaine" grid, with auto-rotating organic radii.
 *
 * Laws of UX:
 *  - Law of Common Region: each plant is one organic-radius card.
 *  - Law of Proximity: photo, name, status and optional voice bubble bundle.
 *  - Aesthetic-Usability Effect: organic radii, paper shadows, micro tap feedback.
 *
 * Personification:
 *  - Runs `pickMessage` once at mount when `bubbleSlot` is true.
 *  - Decision deterministic per (plant.id, UTC date) — no jitter on re-render.
 */
export function PlantCard({
  plant,
  variant = "standard",
  index = 0,
  bubbleSlot = false,
  showQuickWater = false,
  onWatered,
}: Props) {
  const prefersReduced = useReducedMotion();
  const lastWateredAt = useMemo(() => new Date(plant.lastWateredAt), [plant.lastWateredAt]);
  const updatedAtMs = useMemo(() => new Date(plant.updatedAt).getTime(), [plant.updatedAt]);
  const watering = computeWatering(lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;
  const photoUrl = plant.photoMime ? `/api/plants/${plant.id}/photo?v=${updatedAtMs}` : null;
  const radiusToken = ORGANIC_RADII[index % ORGANIC_RADII.length]!;
  const isUrgent = watering.status === "overdue" || watering.status === "due";

  const [bubble, setBubble] = useState<{ message: PersonificationMessage; position: BubblePosition } | null>(null);
  useEffect(() => {
    if (!bubbleSlot) return;
    const message = pickMessage(
      { id: plant.id, lastWateredAt, wateringFrequencyDays: plant.wateringFrequencyDays },
      new Date(),
    );
    if (!message) return;
    const positionIdx = positionIndex(plant.id) % BUBBLE_POSITIONS.length;
    setBubble({ message, position: BUBBLE_POSITIONS[positionIdx]! });
  }, [bubbleSlot, plant.id, plant.wateringFrequencyDays, lastWateredAt]);

  const wrapper = (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: prefersReduced ? 0 : index * 0.06 }}
    >
      {variant === "urgent" ? (
        <UrgentLayout
          plant={plant}
          title={title}
          photoUrl={photoUrl}
          watering={watering}
          isUrgent={isUrgent}
          radiusToken={radiusToken}
          bubble={bubble}
          showQuickWater={showQuickWater}
          onWatered={onWatered}
          prefersReduced={prefersReduced}
        />
      ) : variant === "compact" ? (
        <CompactLayout
          plant={plant}
          title={title}
          photoUrl={photoUrl}
          watering={watering}
          radiusToken={radiusToken}
          bubble={bubble}
          prefersReduced={prefersReduced}
        />
      ) : (
        <StandardLayout
          plant={plant}
          title={title}
          photoUrl={photoUrl}
          watering={watering}
          bubble={bubble}
          prefersReduced={prefersReduced}
        />
      )}
    </motion.div>
  );

  return wrapper;
}

/* ────────────────────────────────────────────────────────────────────────── */

type LayoutBaseProps = {
  plant: PlantCardData;
  title: string;
  photoUrl: string | null;
  watering: ReturnType<typeof computeWatering>;
  bubble: { message: PersonificationMessage; position: BubblePosition } | null;
  prefersReduced: boolean | null;
};

function StandardLayout({ plant, title, photoUrl, watering, bubble, prefersReduced }: LayoutBaseProps) {
  return (
    <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
      <Link href={`/plants/${plant.id}`} className="block">
        <Card radius="organic-1" elevation="paper" padding="none" className="overflow-hidden">
          <div className={cn("relative aspect-[4/3]", photoUrl ? "bg-paper-100" : "bg-paper-100 paper-grain")}>
            {photoUrl ? (
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
            {bubble ? <PlantBubble size="sm" position={bubble.position} message={bubble.message.text} /> : null}
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
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

type UrgentLayoutProps = LayoutBaseProps & {
  isUrgent: boolean;
  radiusToken: (typeof ORGANIC_RADII)[number];
  showQuickWater: boolean;
  onWatered?: (plantId: string) => void;
};

function UrgentLayout({
  plant,
  title,
  photoUrl,
  watering,
  isUrgent,
  radiusToken,
  bubble,
  showQuickWater,
  onWatered,
  prefersReduced,
}: UrgentLayoutProps) {
  const radiusClass = radiusToken === "organic-1" ? "rounded-organic-1" : radiusToken === "organic-2" ? "rounded-organic-2" : "rounded-organic-3";
  const photoRadius = "rounded-[18px_24px_18px_24px]";
  return (
    <motion.div whileTap={prefersReduced ? undefined : { scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
      <Link href={`/plants/${plant.id}`} className="block">
        <div className={cn("relative bg-white shadow-paper p-3", radiusClass)}>
          <div className="flex gap-3 items-center">
            <div className={cn("relative w-20 h-20 shrink-0 overflow-hidden bg-moss-100", photoRadius)}>
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={title} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-moss-400" aria-hidden="true">
                  <Leaf size={36} />
                </div>
              )}
              {isUrgent ? (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -left-1 w-7 h-7 bg-terracotta-500 rounded-full flex items-center justify-center shadow-paper motion-safe:animate-drop-pulse text-paper-50"
                >
                  <Droplet size={14} />
                </span>
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-xl text-ink-800 leading-tight truncate">{title}</h4>
              {plant.species ? (
                <p className="font-serif italic text-xs text-ink-400 truncate">{plant.species}</p>
              ) : null}
              <p className="text-[13px] text-terracotta-600 font-medium mt-1">
                {statusDescription(watering.status, watering.diffDays)}
              </p>
            </div>
            {showQuickWater ? (
              <QuickWaterButton
                plantId={plant.id}
                onWatered={() => onWatered?.(plant.id)}
                stopPropagation
              />
            ) : null}
          </div>
          {bubble ? <PlantBubble size="sm" position={bubble.position} message={bubble.message.text} /> : null}
        </div>
      </Link>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

type CompactLayoutProps = LayoutBaseProps & {
  radiusToken: (typeof ORGANIC_RADII)[number];
};

function CompactLayout({ plant, title, photoUrl, watering, radiusToken, bubble, prefersReduced }: CompactLayoutProps) {
  const radiusClass = radiusToken === "organic-1" ? "rounded-organic-1" : radiusToken === "organic-2" ? "rounded-organic-2" : "rounded-organic-3";
  const photoRadius =
    radiusToken === "organic-1"
      ? "rounded-[18px_22px_18px_22px]"
      : radiusToken === "organic-2"
        ? "rounded-[22px_18px_22px_18px]"
        : "rounded-[18px_22px_22px_18px]";
  const upcomingLabel =
    watering.status === "soon" ? "demain" : watering.status === "due" ? "aujourd'hui" : `dans ${Math.max(watering.diffDays, 1)} j`;
  return (
    <motion.div whileTap={prefersReduced ? undefined : { scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
      <Link href={`/plants/${plant.id}`} className="block">
        <div className={cn("relative bg-white shadow-paper p-2.5", radiusClass)}>
          {bubble ? <PlantBubble size="sm" position={bubble.position} message={bubble.message.text} /> : null}
          <div className={cn("aspect-[4/5] overflow-hidden bg-moss-100 mb-2", photoRadius)}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={title} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-moss-400" aria-hidden="true">
                <Leaf size={36} />
              </div>
            )}
          </div>
          <h4 className="font-serif text-base text-ink-800 leading-tight truncate">{title}</h4>
          {plant.species ? (
            <p className="font-serif italic text-[11px] text-ink-400 truncate">{plant.species}</p>
          ) : null}
          <p className="text-[11px] text-moss-600 mt-1">{upcomingLabel}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/** Stable index derived from plant.id, used only to spread bubble positions across cards. */
function positionIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
