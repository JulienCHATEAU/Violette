import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlantForm } from "@/components/PlantForm";
import { PhotoUpload } from "@/components/PhotoUpload";
import { getSession } from "@/lib/auth/session";
import type { HumidityLevel, SunlightExposure } from "@/lib/zod-schemas";
import { Card } from "@/design-system/components/Card";
import { H1, H3, Body, Italic } from "@/design-system/components/Typography";
import { ArrowLeft, Camera, Leaf } from "@/design-system/icons";

export const dynamic = "force-dynamic";

/**
 * Edit plant — same `PlantForm` as the create flow, hydrated with current values.
 *
 * Photo management lives here (moved from the detail screen, which now stays a
 * pure read view). The card shows the current thumbnail when available so the
 * user knows what they're replacing.
 */
export default async function EditPlantPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const plant = await prisma.plant.findFirst({ where: { id: params.id, ownerId: session.sub }, omit: { photo: true } });
  if (!plant) notFound();

  const title = plant.nickname || plant.name;
  const hasPhoto = !!plant.photoMime;
  const photoUrl = hasPhoto ? `/api/plants/${plant.id}/photo?v=${plant.updatedAt.getTime()}` : null;

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

      {/* Photo management */}
      <Card radius="organic-2" elevation="paper" padding="lg" className="space-y-3">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-terracotta-500" />
          <H3>Photo</H3>
        </div>
        <div
          className="relative w-full aspect-[4/3] overflow-hidden bg-paper-100"
          style={{ borderRadius: "28px 36px 28px 36px" }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-moss-400 paper-grain" aria-hidden="true">
              <Leaf size={48} />
            </div>
          )}
        </div>
        {!hasPhoto ? (
          <Body className="text-sm text-ink-600">
            Aucune photo pour l&apos;instant. Ajoute-en une pour la faire vivre dans tes listes.
          </Body>
        ) : null}
        <PhotoUpload plantId={plant.id} hasPhoto={hasPhoto} />
      </Card>

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
