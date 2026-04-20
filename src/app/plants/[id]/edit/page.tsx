import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PlantForm } from "@/components/PlantForm";
import { getSession } from "@/lib/auth/session";
import type { HumidityLevel, SunlightExposure } from "@/lib/zod-schemas";

export const dynamic = "force-dynamic";

export default async function EditPlantPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const plant = await prisma.plant.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!plant) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/plants/${plant.id}`}
          aria-label="Retour"
          className="inline-flex items-center text-violet-700 dark:text-violet-300"
        >
          <ChevronLeft size={24} strokeWidth={1.8} />
        </Link>
        <h1 className="text-2xl font-bold">Modifier</h1>
      </div>
      <PlantForm
        mode="edit"
        plantId={plant.id}
        initial={{
          name: plant.name,
          nickname: plant.nickname,
          description: plant.description,
          species: plant.species,
          wateringFrequencyDays: plant.wateringFrequencyDays,
          sunlightExposure: plant.sunlightExposure as SunlightExposure,
          humidity: plant.humidity as HumidityLevel,
          temperatureRange: plant.temperatureRange,
          notes: plant.notes,
        }}
      />
    </div>
  );
}
