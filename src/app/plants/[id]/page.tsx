import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Droplet, Info, Leaf, NotebookText, Sun, Thermometer, Wind } from "lucide-react";
import { prisma } from "@/lib/db";
import { WaterButton } from "@/components/WaterButton";
import { PhotoUpload } from "@/components/PhotoUpload";
import {
  computeWatering,
  statusColor,
  statusLabel,
  SUNLIGHT_LABEL,
  HUMIDITY_LABEL,
} from "@/lib/watering";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const plant = await prisma.plant.findFirst({
    where: { id: params.id, ownerId: session.sub },
    include: { wateringLogs: { orderBy: { wateredAt: "desc" }, take: 15 } },
  });
  if (!plant) notFound();

  const w = computeWatering(plant.lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;
  const daysSince = Math.floor((Date.now() - plant.lastWateredAt.getTime()) / 86_400_000);
  const hasPhoto = !!plant.photoMime;
  const photoUrl = hasPhoto ? `/api/plants/${plant.id}/photo?v=${plant.updatedAt.getTime()}` : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/plants"
          aria-label="Retour"
          className="inline-flex items-center text-violet-700 dark:text-violet-300"
        >
          <ChevronLeft size={24} strokeWidth={1.8} />
        </Link>
        <Link href={`/plants/${plant.id}/edit`} className="text-sm text-violet-700 dark:text-violet-300">
          Modifier
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden border border-sage-100 bg-white dark:bg-zinc-900 shadow-soft">
        <div className="aspect-[4/3] bg-sage-50 dark:bg-sage-900/20 relative">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-sage-400" aria-hidden>
              <Leaf size={72} strokeWidth={1.2} />
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {plant.nickname && plant.name !== plant.nickname && (
              <div className="text-sm text-zinc-500">{plant.name}</div>
            )}
            {plant.species && <div className="text-xs italic text-zinc-500">{plant.species}</div>}
          </div>
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full border ${statusColor(w.status)}`}
          >
            {statusLabel(w.status)}
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Dernier arrosage il y a {daysSince}j • prochain{" "}
            {w.diffDays < 0 ? `en retard de ${Math.abs(w.diffDays)}j` : `dans ${w.diffDays}j`}
          </p>
          <PhotoUpload plantId={plant.id} hasPhoto={hasPhoto} />
        </div>
      </div>

      <WaterButton plantId={plant.id} />

      <section className="rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-sage-700">
          <Info size={18} strokeWidth={2} />
          Fiche
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Detail icon={<Droplet size={16} className="text-violet-600" />} label="Arrosage">
            Tous les {plant.wateringFrequencyDays}j
          </Detail>
          <Detail icon={<Sun size={16} className="text-amber-500" />} label="Exposition">
            {SUNLIGHT_LABEL[plant.sunlightExposure] ?? plant.sunlightExposure}
          </Detail>
          <Detail icon={<Wind size={16} className="text-sky-500" />} label="Humidité">
            {HUMIDITY_LABEL[plant.humidity] ?? plant.humidity}
          </Detail>
          <Detail icon={<Thermometer size={16} className="text-rose-500" />} label="Température">
            {plant.temperatureRange ?? "—"}
          </Detail>
        </dl>
        {plant.description && (
          <div>
            <div className="text-xs text-zinc-500">Description</div>
            <p className="text-sm">{plant.description}</p>
          </div>
        )}
        {plant.notes && (
          <div>
            <div className="text-xs text-zinc-500">Notes</div>
            <p className="text-sm whitespace-pre-wrap">{plant.notes}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-sage-700 mb-3">
          <NotebookText size={18} strokeWidth={2} />
          Historique d'arrosage
        </h2>
        {plant.wateringLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun arrosage enregistré.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {plant.wateringLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between border-b border-sage-50 last:border-0 py-1.5">
                <span className="flex items-center gap-2">
                  <Droplet size={14} className="text-violet-500" />
                  {new Date(log.wateredAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                </span>
                {log.note && <span className="text-zinc-500 text-xs">{log.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Detail({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-zinc-500 text-xs">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
