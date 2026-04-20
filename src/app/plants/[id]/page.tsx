import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WaterButton } from "@/components/WaterButton";
import {
  computeWatering,
  statusColor,
  statusLabel,
  SUNLIGHT_LABEL,
  HUMIDITY_LABEL,
} from "@/lib/watering";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const plant = await prisma.plant.findUnique({
    where: { id: params.id },
    include: { wateringLogs: { orderBy: { wateredAt: "desc" }, take: 15 } },
  });
  if (!plant) notFound();

  const w = computeWatering(plant.lastWateredAt, plant.wateringFrequencyDays);
  const title = plant.nickname || plant.name;
  const daysSince = Math.floor((Date.now() - plant.lastWateredAt.getTime()) / 86_400_000);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/plants" aria-label="Retour" className="text-xl">‹</Link>
        <Link href={`/plants/${plant.id}/edit`} className="text-sm text-leaf-700">Modifier</Link>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white dark:bg-zinc-900">
        <div className="aspect-[4/3] bg-leaf-50 dark:bg-leaf-900/20">
          {plant.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plant.photoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-6xl" aria-hidden>🌿</div>
          )}
        </div>
        <div className="p-4 space-y-2">
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
        </div>
      </div>

      <WaterButton plantId={plant.id} />

      <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-4 space-y-3">
        <h2 className="font-semibold">ℹ️ Fiche</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Arrosage</dt>
            <dd>Tous les {plant.wateringFrequencyDays}j</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Exposition</dt>
            <dd>{SUNLIGHT_LABEL[plant.sunlightExposure] ?? plant.sunlightExposure}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Humidité</dt>
            <dd>{HUMIDITY_LABEL[plant.humidity] ?? plant.humidity}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Température</dt>
            <dd>{plant.temperatureRange ?? "—"}</dd>
          </div>
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

      <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-4">
        <h2 className="font-semibold mb-2">📝 Historique d'arrosage</h2>
        {plant.wateringLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun arrosage enregistré.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {plant.wateringLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between border-b last:border-0 py-1">
                <span>💧 {new Date(log.wateredAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</span>
                {log.note && <span className="text-zinc-500 text-xs">{log.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
