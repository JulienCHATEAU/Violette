import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { WaterAction } from "@/components/WaterAction";
import { PlantHeroBubble } from "@/components/PlantHeroBubble";
import { computeWatering, SUNLIGHT_LABEL, HUMIDITY_LABEL } from "@/lib/watering";
import { getSession } from "@/lib/auth/session";
import { relativeTimeFr } from "@/lib/relative-time";
import { H1, H3, Body, Italic, Label } from "@/design-system/components/Typography";
import { ArrowLeft, Cloud, Droplet, Edit, Leaf, Plus, Sun, Thermometer } from "@/design-system/icons";
import { cn } from "@/design-system/lib/cn";

export const dynamic = "force-dynamic";

/**
 * Plant detail — herbarium-style single-plant page, faithful to mockup A.
 *
 * Composition:
 *  - Hero photo with overlay + circular back/edit buttons + personification bubble.
 *  - Title block with contextual eyebrow ("Humidité · Lumière").
 *  - WaterAction Card (peak moment).
 *  - "Sa fiche" — 2×2 grid of organic mini info cards.
 *  - Timeline history — adoption + waterings, oldest at the bottom.
 *  - Notes / Description sections (optional, shown only when present).
 *
 * Laws of UX:
 *  - Peak-End Rule: WaterAction headline + emotional copy + celebration overlay.
 *  - Law of Common Region: each block stays in its own organic shape.
 *  - Law of Proximity: hero, name, status and CTA stack tightly.
 *  - Aesthetic-Usability: organic radii, paper-grain placeholder, italic species,
 *    BotanicalLeaf accent on the WaterAction card.
 */
export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const plant = await prisma.plant.findFirst({
    where: { id: params.id, ownerId: session.sub },
    include: { wateringLogs: { orderBy: { wateredAt: "desc" }, take: 15 } },
    omit: { photo: true },
  });
  if (!plant) notFound();

  const w = computeWatering(plant.lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;
  const hasPhoto = !!plant.photoMime;
  const photoUrl = hasPhoto ? `/api/plants/${plant.id}/photo?v=${plant.updatedAt.getTime()}` : null;

  const sunlight = SUNLIGHT_LABEL[plant.sunlightExposure] ?? plant.sunlightExposure;
  const humidity = HUMIDITY_LABEL[plant.humidity] ?? plant.humidity;
  const eyebrow = `${humidity} · ${sunlight}`;

  return (
    <div className="space-y-6">
      {/* Hero photo */}
      <section className="relative">
        <div
          className="relative overflow-hidden h-72 shadow-lift bg-paper-100"
          style={{ borderRadius: "36px 44px 36px 44px" }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-moss-400 paper-grain" aria-hidden="true">
              <Leaf size={72} />
            </div>
          )}
          {photoUrl ? (
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
          ) : null}
          <Link
            href="/plants"
            aria-label="Retour à la liste"
            className="absolute top-4 left-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-paper-50/95 backdrop-blur shadow-paper text-ink-800 transition-colors duration-180 ease-organic hover:bg-paper-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/30"
          >
            <ArrowLeft size={18} />
          </Link>
          <Link
            href={`/plants/${plant.id}/edit`}
            aria-label="Modifier cette plante"
            className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-paper-50/95 backdrop-blur shadow-paper text-ink-800 transition-colors duration-180 ease-organic hover:bg-paper-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/30"
          >
            <Edit size={16} />
          </Link>
          <PlantHeroBubble
            plantId={plant.id}
            lastWateredAt={plant.lastWateredAt}
            wateringFrequencyDays={plant.wateringFrequencyDays}
          />
        </div>
      </section>

      {/* Title block */}
      <header className="px-1">
        <p className="text-[11px] uppercase tracking-[.2em] text-terracotta-600 font-semibold">{eyebrow}</p>
        <H1 className="text-4xl mt-1 leading-none">{title}</H1>
        {plant.species ? (
          <p className="mt-1.5">
            <Italic className="text-base text-ink-400">{plant.species}</Italic>
          </p>
        ) : null}
        {plant.nickname && plant.name !== plant.nickname ? (
          <p className="mt-0.5 font-sans text-xs text-ink-400">{plant.name}</p>
        ) : null}
      </header>

      <div className="filet-h" />

      {/* Peak moment */}
      <WaterAction
        plantId={plant.id}
        plantName={title}
        wateringStatus={w.status}
        diffDays={w.diffDays}
      />

      {/* Sa fiche — 2x2 mini cards */}
      <section className="space-y-3">
        <H3 className="px-1">Sa fiche</H3>
        <div className="grid grid-cols-2 gap-3">
          <MiniInfoCard
            radius="organic-2"
            icon={<Sun size={22} className="text-terracotta-500" />}
            label="Lumière"
            value={sunlight}
          />
          <MiniInfoCard
            radius="organic-3"
            icon={<Droplet size={22} className="text-moss-500" />}
            label="Humidité"
            value={humidity}
          />
          <MiniInfoCard
            radius="organic-1"
            icon={<Thermometer size={22} className="text-terracotta-500" />}
            label="Température"
            value={plant.temperature !== null && plant.temperature !== undefined ? `${plant.temperature}°C` : "—"}
          />
          <MiniInfoCard
            radius="organic-2"
            icon={<Cloud size={22} className="text-moss-500" />}
            label="Fréquence"
            value={`tous les ${plant.wateringFrequencyDays} j`}
          />
        </div>
      </section>

      {/* Historique */}
      <section className="space-y-3">
        <H3 className="px-1">Historique</H3>
        <div className="bg-white rounded-organic-3 shadow-paper p-4 space-y-4">
          {plant.wateringLogs.map((log) => (
            <HistoryRow
              key={log.id}
              icon={<Droplet size={14} className="text-terracotta-500" />}
              iconBg="bg-terracotta-100 border-terracotta-200"
              label="Arrosée"
              detail={relativeTimeFr(log.wateredAt)}
              note={log.note}
              showDivider
            />
          ))}
          <HistoryRow
            icon={<Plus size={14} className="text-ink-600" />}
            iconBg="bg-paper-200 border-paper-300"
            label="Adoptée"
            detail={relativeTimeFr(plant.createdAt)}
            showDivider={false}
          />
        </div>
      </section>

      {/* Description / Notes */}
      {plant.description || plant.notes ? (
        <section className="space-y-3">
          {plant.description ? (
            <div className="bg-white rounded-organic-2 shadow-paper p-5">
              <Label>Description</Label>
              <Body className="mt-1 text-sm">{plant.description}</Body>
            </div>
          ) : null}
          {plant.notes ? (
            <div className="bg-white rounded-organic-3 shadow-paper p-5">
              <Label>Notes</Label>
              <Body className="mt-1 text-sm whitespace-pre-wrap">{plant.notes}</Body>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function MiniInfoCard({
  radius,
  icon,
  label,
  value,
}: {
  radius: "organic-1" | "organic-2" | "organic-3";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const radiusClass =
    radius === "organic-1"
      ? "rounded-organic-1"
      : radius === "organic-2"
        ? "rounded-organic-2"
        : "rounded-organic-3";
  return (
    <div className={cn("bg-paper-50 border border-paper-200 p-3", radiusClass)}>
      {icon}
      <p className="text-[11px] uppercase tracking-wider text-ink-400 mt-2 font-semibold">{label}</p>
      <p className="font-serif text-base text-ink-800 mt-0.5">{value}</p>
    </div>
  );
}

function HistoryRow({
  icon,
  iconBg,
  label,
  detail,
  note,
  showDivider,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  detail: string;
  note?: string | null;
  showDivider: boolean;
}) {
  return (
    <>
      <div className="flex gap-3">
        <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center shrink-0", iconBg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm text-ink-800">{label}</p>
          <p className="text-xs text-ink-400">
            {detail}
            {note ? ` · ${note}` : ""}
          </p>
        </div>
      </div>
      {showDivider ? <div className="filet-h" /> : null}
    </>
  );
}
