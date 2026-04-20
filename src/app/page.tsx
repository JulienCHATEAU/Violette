import Link from "next/link";
import { prisma } from "@/lib/db";
import { PlantCard } from "@/components/PlantCard";
import { computeWatering } from "@/lib/watering";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const plants = await prisma.plant.findMany({ orderBy: { createdAt: "desc" } });

  const withStatus = plants.map((p) => ({ p, w: computeWatering(p.lastWateredAt, p.wateringFrequencyDays) }));
  const overdue = withStatus.filter((x) => x.w.status === "overdue").map((x) => x.p);
  const due = withStatus.filter((x) => x.w.status === "due").map((x) => x.p);
  const soon = withStatus.filter((x) => x.w.status === "soon").map((x) => x.p);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          🌱 <span className="text-leaf-700">Violette</span>
        </h1>
        <Link href="/plants/new" className="text-sm rounded-lg bg-leaf-600 text-white px-3 py-1.5">
          + Ajouter
        </Link>
      </header>

      {overdue.length + due.length > 0 && (
        <section>
          <h2 className="font-semibold text-red-700">🚨 À arroser ({overdue.length + due.length})</h2>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[...overdue, ...due].map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section>
          <h2 className="font-semibold">📅 Demain ({soon.length})</h2>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {soon.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">🌿 Toutes mes plantes ({plants.length})</h2>
          <Link href="/plants" className="text-sm text-leaf-700">Voir tout →</Link>
        </div>
        {plants.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
            Pas encore de plante — commence par en <Link href="/plants/new" className="text-leaf-700 underline">ajouter une</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {plants.slice(0, 6).map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
