import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PlantCard } from "@/components/PlantCard";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PlantsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const plants = await prisma.plant.findMany({
    where: { ownerId: session.sub },
    orderBy: { name: "asc" },
  });
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes plantes</h1>
        <Link
          href="/plants/new"
          className="inline-flex items-center gap-1 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 shadow-soft transition"
        >
          <Plus size={16} strokeWidth={2.4} />
          Ajouter
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
