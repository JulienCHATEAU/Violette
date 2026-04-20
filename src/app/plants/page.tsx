import Link from "next/link";
import { prisma } from "@/lib/db";
import { PlantCard } from "@/components/PlantCard";

export const dynamic = "force-dynamic";

export default async function PlantsListPage() {
  const plants = await prisma.plant.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes plantes</h1>
        <Link href="/plants/new" className="text-sm rounded-lg bg-leaf-600 text-white px-3 py-1.5">
          + Ajouter
        </Link>
      </header>
      {plants.length === 0 ? (
        <p className="text-zinc-500">Aucune plante pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {plants.map((p) => (
            <PlantCard key={p.id} plant={p} />
          ))}
        </div>
      )}
    </div>
  );
}
