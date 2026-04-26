import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { WaterAction } from "@/components/WaterAction";
import { PhotoUpload } from "@/components/PhotoUpload";
import { computeWatering, SUNLIGHT_LABEL, HUMIDITY_LABEL, type WateringStatus } from "@/lib/watering";
import { getSession } from "@/lib/auth/session";
import { Card } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import { Button } from "@/design-system/components/Button";
import { H1, H3, Body, Caption, Italic, Label } from "@/design-system/components/Typography";
import { ArrowLeft, Cloud, Droplet, Leaf, Sun, Thermometer } from "@/design-system/icons";

export const dynamic = "force-dynamic";

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

/**
 * Plant detail — single-plant page with the watering peak moment.
 *
 * Laws of UX:
 *  - Peak-End Rule: WaterAction (DS WaterCTA + celebration overlay) is the
 *    high point of the journey.
 *  - Law of Common Region: each block is its own organic Card.
 *  - Law of Proximity: photo, name, status and the action button stack tightly.
 *  - Aesthetic-Usability: organic radii, paper-grain placeholder, italic species.
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
  const daysSince = Math.floor((Date.now() - plant.lastWateredAt.getTime()) / 86_400_000);
  const hasPhoto = !!plant.photoMime;
  const photoUrl = hasPhoto ? `/api/plants/${plant.id}/photo?v=${plant.updatedAt.getTime()}` : null;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/plants"
          aria-label="Retour à la liste"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
        >
          <ArrowLeft size={20} />
        </Link>
        <Link href={`/plants/${plant.id}/edit`}>
          <Button variant="secondary" size="sm">Modifier</Button>
        </Link>
      </div>

      {/* Hero card */}
      <Card radius="organic-1" elevation="paper" padding="none" className="overflow-hidden">
        <div className="aspect-[4/3] bg-paper-100 paper-grain relative">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-moss-400" aria-hidden="true">
              <Leaf size={72} />
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div>
            <H1 className="text-3xl">{title}</H1>
            {plant.nickname && plant.name !== plant.nickname ? (
              <Caption className="mt-0.5">{plant.name}</Caption>
            ) : null}
            {plant.species ? (
              <p className="mt-0.5">
                <Italic className="text-sm text-ink-400">{plant.species}</Italic>
              </p>
            ) : null}
          </div>
          <div>
            <Badge variant={STATUS_TO_BADGE[w.status]}>{STATUS_LABEL[w.status]}</Badge>
          </div>
          <Body className="text-sm text-ink-600">
            Dernier arrosage il y a {daysSince}j • prochain{" "}
            {w.diffDays < 0 ? `en retard de ${Math.abs(w.diffDays)}j` : `dans ${w.diffDays}j`}
          </Body>
          <PhotoUpload plantId={plant.id} hasPhoto={hasPhoto} />
        </div>
      </Card>

      {/* Peak moment */}
      <WaterAction plantId={plant.id} plantName={title} />

      {/* Care sheet */}
      <Card radius="organic-2" elevation="paper" padding="lg" className="space-y-5">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-moss-500" />
          <H3>Fiche</H3>
        </div>
        <dl className="grid grid-cols-2 gap-5">
          <Detail icon={<Droplet size={16} className="text-terracotta-500" />} label="Arrosage">
            Tous les {plant.wateringFrequencyDays}j
          </Detail>
          <Detail icon={<Sun size={16} className="text-terracotta-400" />} label="Exposition">
            {SUNLIGHT_LABEL[plant.sunlightExposure] ?? plant.sunlightExposure}
          </Detail>
          <Detail icon={<Cloud size={16} className="text-moss-500" />} label="Humidité">
            {HUMIDITY_LABEL[plant.humidity] ?? plant.humidity}
          </Detail>
          <Detail icon={<Thermometer size={16} className="text-terracotta-500" />} label="Température">
            {plant.temperature !== null && plant.temperature !== undefined ? `${plant.temperature}°C` : "—"}
          </Detail>
        </dl>
        {plant.description ? (
          <div>
            <Label>Description</Label>
            <Body className="mt-1 text-sm">{plant.description}</Body>
          </div>
        ) : null}
        {plant.notes ? (
          <div>
            <Label>Notes</Label>
            <Body className="mt-1 text-sm whitespace-pre-wrap">{plant.notes}</Body>
          </div>
        ) : null}
      </Card>

      {/* Watering history */}
      <Card radius="organic-2" elevation="paper" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Droplet size={18} className="text-terracotta-500" />
          <H3>Historique d&apos;arrosage</H3>
        </div>
        {plant.wateringLogs.length === 0 ? (
          <Body className="text-sm text-ink-400">Aucun arrosage enregistré pour le moment.</Body>
        ) : (
          <ul className="space-y-1.5">
            {plant.wateringLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between border-b border-paper-200 last:border-0 py-2 font-sans text-sm text-ink-800"
              >
                <span className="flex items-center gap-2">
                  <Droplet size={14} className="text-terracotta-400" />
                  {new Date(log.wateredAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                {log.note ? <span className="text-ink-400 text-xs">{log.note}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Detail({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5">
        {icon}
        <Label>{label}</Label>
      </dt>
      <dd className="mt-1 font-sans text-sm text-ink-800">{children}</dd>
    </div>
  );
}
