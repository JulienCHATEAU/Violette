"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlantCard, type PlantCardData } from "./PlantCard";
import { Droplet, Leaf } from "@/design-system/icons";

type Props = {
  urgent: PlantCardData[];
  thisWeek: PlantCardData[];
};

/**
 * Dashboard interactive surface — orchestrates the two organic sections, the
 * shared bubble budget (≤ 30% of visible cards) and the optimistic dismissal
 * of cards once their plant has been quick-watered.
 *
 * The "urgent" section uses a bespoke layout: the most overdue plant gets a
 * large hero card with bubble + pulsing droplet, the rest stack as horizontal
 * rows with an inline `QuickWaterButton`. The "cette semaine" section reuses
 * the `compact` variant in a 2-column grid, with auto-rotating organic radii.
 */
export function DashboardSections({ urgent, thisWeek }: Props) {
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());

  const visibleUrgent = useMemo(() => urgent.filter((p) => !dismissed.has(p.id)), [urgent, dismissed]);

  // Bubble budget — ~30% of currently visible cards across both sections.
  const slots = useMemo(() => {
    const allVisible = [...visibleUrgent, ...thisWeek];
    const budget = Math.floor(allVisible.length * 0.3);
    return new Set(allVisible.slice(0, Math.max(0, budget)).map((p) => p.id));
  }, [visibleUrgent, thisWeek]);

  const handleWatered = (plantId: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(plantId);
      return next;
    });
  };

  return (
    <>
      {visibleUrgent.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader
            icon={<Droplet size={18} className="text-terracotta-500" />}
            title="À arroser"
            tag="aujourd'hui"
            tagColor="text-terracotta-600"
          />
          <AnimatePresence initial={false} mode="popLayout">
            {visibleUrgent.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                exit={{ opacity: 0, x: 60, scale: 0.96, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }}
              >
                <PlantCard
                  plant={p}
                  variant="urgent"
                  index={i}
                  bubbleSlot={i === 0 && slots.has(p.id)}
                  showQuickWater={i > 0}
                  onWatered={handleWatered}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      ) : null}

      {thisWeek.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader
            icon={<Leaf size={18} className="text-moss-500" />}
            title="Cette semaine"
            tag="à venir"
            tagColor="text-moss-600"
          />
          <div className="grid grid-cols-2 gap-3">
            {thisWeek.map((p, i) => (
              <PlantCard
                key={p.id}
                plant={p}
                variant="compact"
                index={visibleUrgent.length + i}
                bubbleSlot={slots.has(p.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function SectionHeader({
  icon,
  title,
  tag,
  tagColor,
}: {
  icon: React.ReactNode;
  title: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-serif text-lg text-ink-800">{title}</h3>
      </div>
      <span className={`text-[11px] uppercase tracking-widest ${tagColor} font-semibold`}>{tag}</span>
    </div>
  );
}
