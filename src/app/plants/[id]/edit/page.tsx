import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlantForm } from "@/components/PlantForm";
import type { HumidityLevel, SunlightExposure } from "@/lib/zod-schemas";

export const dynamic = "force-dynamic";

export default async function EditPlantPage({ params }: { params: { id: string } }) {
  const plant = await prisma.plant.findUnique({ where: { id: params.id } });
  if (!plant) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/plants/${plant.id}`} aria-label="Retour" className="text-xl">‹</Link>
        <h1 className="text-2xl font-bold">Modifier</h1>
      </div>
      <PlantForm
        mode="edit"
        plantId={plant.id}
        initial={{
          name: plant.name,
          nickname: plant.nickname,
          photoUrl: plant.photoUrl,
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
