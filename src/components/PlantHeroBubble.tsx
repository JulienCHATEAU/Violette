"use client";

import { useEffect, useState } from "react";
import { PlantBubble } from "@/design-system/components/PlantBubble";
import { pickMessage } from "@/lib/personification/select";
import type { PersonificationMessage } from "@/lib/personification/types";

type Props = {
  plantId: string;
  lastWateredAt: Date | string;
  wateringFrequencyDays: number;
};

/**
 * Tiny client wrapper that resolves a personification bubble at mount and pins
 * it to the bottom-left of the detail screen's hero photo. The hero itself can
 * stay a server component since the bubble lives in a separate client island.
 */
export function PlantHeroBubble({ plantId, lastWateredAt, wateringFrequencyDays }: Props) {
  const [message, setMessage] = useState<PersonificationMessage | null>(null);

  useEffect(() => {
    const m = pickMessage(
      { id: plantId, lastWateredAt, wateringFrequencyDays },
      new Date(),
    );
    setMessage(m);
  }, [plantId, lastWateredAt, wateringFrequencyDays]);

  if (!message) return null;
  return <PlantBubble size="md" position="bottom-left" message={message.text} />;
}
