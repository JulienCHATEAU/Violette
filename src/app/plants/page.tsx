import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { PlantList } from "@/components/PlantList";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { H1, H3, Body, Italic } from "@/design-system/components/Typography";
import { BotanicalLeaf } from "@/design-system/decorations/BotanicalLeaf";
import { PlantPot, Plus } from "@/design-system/icons";



export const dynamic = "force-dynamic";

/**
 * Plants list — every plant the user owns, sorted alphabetically.
 *
 * Laws of UX:
 *  - Hick's Law: single header CTA (Ajouter) — the bottom Nav already exposes the
 *    photo-first FAB, so this complements it for manual entry without photo.
 *  - Aesthetic-Usability Effect: BotanicalLeaf accent + filet horizontal anchor
 *    the herbarium identity; animated grid; occasional plant bubbles via
 *    `<PlantList>` budget.
 */
export default async function PlantsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plants = await prisma.plant.findMany({
    where: { ownerId: session.sub },
    orderBy: { name: "asc" },
    omit: { photo: true },
  });

  const count = plants.length;
  const eyebrow = count === 0 ? "Famille verte" : count === 1 ? "1 plante" : `${count} plantes`;

  return (
    <div className="space-y-6">
      <header className="relative">
        <BotanicalLeaf
          size={120}
          className="absolute -top-2 -right-3 text-moss-500 opacity-30 z-0"
        />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.2em] text-ink-400 font-semibold">{eyebrow}</p>
          <H1 className="mt-1 text-ink-800">Mes plantes</H1>
          <p className="mt-1.5 font-serif italic text-ink-600 text-base">
            <Italic className="text-ink-600">Toute ta petite famille verte.</Italic>
          </p>
        </div>
      </header>

      <div className="filet-h" />

      {count === 0 ? <EmptyState /> : <PlantList plants={plants} appendAddTile />}
    </div>
  );
}

function EmptyState() {
  return (
    <Card radius="organic-1" elevation="paper" padding="lg" textured className="text-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-organic-2 bg-moss-100 text-moss-600 flex items-center justify-center"
          aria-hidden="true"
        >
          <PlantPot size={36} />
        </div>
        <div>
          <H3 className="text-ink-800">Aucune plante</H3>
          <Body className="mt-1 text-ink-600">Ajoute ta première plante pour la voir apparaître ici.</Body>
        </div>
        <Link href="/plants/new">
          <Button variant="cta" size="md" leadingIcon={<Plus size={18} />}>
            Ajouter une plante
          </Button>
        </Link>
      </div>
    </Card>
  );
}
