"use client";

import { useMemo } from "react";
import { PlantCard, type PlantCardData } from "./PlantCard";

type Props = {
  plants: PlantCardData[];
  /** When provided, this many bubble slots are reserved for these plants out of a global budget. Defaults to a per-list 30% cap. */
  bubbleBudget?: number;
  /** Index offset, useful when several lists share the same staggered animation timeline. */
  indexOffset?: number;
};

/**
 * PlantList — responsive grid of `PlantCard`s.
 *
 * Personification cap: the parent decides which cards may render a bubble. By default
 * we allocate ~30% of visible cards (rounded down) to keep the personification subtle
 * even when the page is otherwise quiet.
 *
 * The cap is intentionally enforced here rather than in `pickMessage`: the lib
 * decides *what* a plant might say; the layout decides *who* gets to speak.
 */
export function PlantList({ plants, bubbleBudget, indexOffset = 0 }: Props) {
  const slots = useMemo(() => {
    const budget = bubbleBudget ?? Math.floor(plants.length * 0.3);
    return new Set(plants.slice(0, Math.max(0, budget)).map((p) => p.id));
  }, [plants, bubbleBudget]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {plants.map((p, i) => (
        <PlantCard key={p.id} plant={p} index={indexOffset + i} bubbleSlot={slots.has(p.id)} />
      ))}
    </div>
  );
}
