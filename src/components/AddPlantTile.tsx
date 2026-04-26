"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "@/design-system/icons";

type Props = {
  /** Index inside the surrounding list, used for staggered entry alignment with the plants. */
  index?: number;
};

/**
 * AddPlantTile — dashed-border placeholder rendered as the last cell of the
 * plant list. Lets the user create a plant manually (no photo) without
 * cluttering the page header with an Ajouter button.
 *
 * Laws of UX:
 *  - Jakob's Law: dashed border is the universal "drop here / add new" cue.
 *  - Aesthetic-Usability Effect: organic radius, terracotta circle accent.
 *  - Fitts's Law: full card is the hit target, well over 44px.
 */
export function AddPlantTile({ index = 0 }: Props) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: prefersReduced ? 0 : index * 0.06 }}
    >
      <motion.div
        whileTap={prefersReduced ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Link
          href="/plants/new"
          aria-label="Ajouter une nouvelle plante"
          className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20 rounded-organic-1"
        >
          <div
            className="relative aspect-[4/5] flex flex-col items-center justify-center gap-3 p-4 text-center bg-paper-50 border-2 border-dashed border-paper-300 hover:border-terracotta-400 transition-colors duration-180 ease-organic"
            style={{ borderRadius: "28px 36px 28px 40px" }}
          >
            <span
              aria-hidden="true"
              className="w-12 h-12 rounded-full bg-terracotta-100 text-terracotta-500 flex items-center justify-center"
            >
              <Plus size={22} />
            </span>
            <p className="font-serif text-base text-ink-800 leading-tight">
              Ajouter une<br />nouvelle plante
            </p>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
