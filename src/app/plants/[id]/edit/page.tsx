import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlantForm } from "@/components/PlantForm";
import { getSession } from "@/lib/auth/session";
import type { HumidityLevel, SunlightExposure } from "@/lib/zod-schemas";
import { H1, Italic } from "@/design-system/components/Typography";
import { ArrowLeft } from "@/design-system/icons";

export const dynamic = "force-dynamic";

/**
 * Edit plant — same `PlantForm` as the create flow, hydrated with current values.
 * Back link returns to the plant detail (vs. the list for the create flow).
 */
export default async function EditPlantPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const plant = await prisma.plant.findFirst({ where: { id: params.id, ownerId: session.sub }, omit: { photo: true } });
  if (!plant) notFound();

  const title = plant.nickname || plant.name;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/plants/${plant.id}`}
          aria-label="Retour à la fiche"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <H1 className="text-3xl">Modifier</H1>
          <p className="font-serif italic text-ink-600 text-base">
            <Italic className="text-ink-600">Affine la fiche de {title}.</Italic>
          </p>
        </div>
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
          temperature: plant.temperature,
          notes: plant.notes,
        }}
      />
    </div>
  );
}
