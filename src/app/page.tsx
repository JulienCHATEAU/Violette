import Link from "next/link";
import { redirect } from "next/navigation";
import { Droplets, Leaf, Plus, Settings, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { PlantCard } from "@/components/PlantCard";
import { computeWatering } from "@/lib/watering";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plants = await prisma.plant.findMany({
    where: { ownerId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  const withStatus = plants.map((p) => ({ p, w: computeWatering(p.lastWateredAt, p.wateringFrequencyDays) }));
  const overdue = withStatus.filter((x) => x.w.status === "overdue").map((x) => x.p);
  const due = withStatus.filter((x) => x.w.status === "due").map((x) => x.p);
  const soon = withStatus.filter((x) => x.w.status === "soon").map((x) => x.p);
  const urgent = [...overdue, ...due];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-violet-700 dark:text-violet-300">
          Violette
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/plants/new"
            className="inline-flex items-center gap-1 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 shadow-soft transition"
          >
            <Plus size={16} strokeWidth={2.4} />
            Ajouter
          </Link>
          <Link
            href="/settings"
            aria-label="Réglages"
            className="rounded-lg border border-violet-100 text-violet-700 dark:text-violet-300 px-2 py-1.5 hover:bg-violet-50 transition"
          >
            <Settings size={18} strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      {urgent.length > 0 && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/50 p-4 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-200">
            <Droplets size={20} strokeWidth={2} />
            À arroser ({urgent.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {urgent.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
            <Sparkles size={18} strokeWidth={2} />
            Demain ({soon.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {soon.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-sage-700 dark:text-sage-300">
            <Leaf size={18} strokeWidth={2} />
            Toutes mes plantes ({plants.length})
          </h2>
          <Link href="/plants" className="text-sm text-violet-700 dark:text-violet-300">
            Voir tout →
          </Link>
        </div>
        {plants.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Pas encore de plante — commence par en{" "}
            <Link href="/plants/new" className="text-violet-700 underline">
              ajouter une
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {plants.slice(0, 6).map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
