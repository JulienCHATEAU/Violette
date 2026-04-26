import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeWatering } from "@/lib/watering";
import { getCurrentUser, userLabel } from "@/lib/user";
import type { PlantCardData } from "@/components/PlantCard";
import { DashboardSections } from "@/components/DashboardSections";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { H1, H3, Body, Italic } from "@/design-system/components/Typography";
import { BotanicalLeaf } from "@/design-system/decorations/BotanicalLeaf";
import { PlantPot, Plus } from "@/design-system/icons";

export const dynamic = "force-dynamic";

const FRENCH_DATE = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

/**
 * Dashboard — herbarium-style home screen, faithful to mockups/variation-a-herbier.html.
 *
 * Laws of UX:
 *  - Hick's Law: only two sections (À arroser / Cette semaine).
 *  - Aesthetic-Usability Effect: botanical decoration, organic radii, paper textures.
 *  - Peak-End Rule (lite): personalised greeting opens the day on a warm note.
 *  - Von Restorff Effect: terracotta-500 reserved for the urgent count and CTAs.
 *
 * Server-rendered: Prisma + watering computation happen here. Interactive bits
 * (quick-water, AnimatePresence, bubbles) are delegated to `<DashboardSections>`.
 */
export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plants = await prisma.plant.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    omit: { photo: true },
  });

  const withStatus = plants.map((p) => ({ p, w: computeWatering(p.lastWateredAt, p.wateringFrequencyDays) }));
  const urgent: PlantCardData[] = withStatus
    .filter((x) => x.w.status === "overdue" || x.w.status === "due")
    // Most overdue first (most negative diffDays), then due (0).
    .sort((a, b) => a.w.diffDays - b.w.diffDays)
    .map((x) => x.p);
  const thisWeek: PlantCardData[] = withStatus
    .filter((x) => x.w.status === "soon" || (x.w.status === "ok" && x.w.diffDays <= 7))
    .sort((a, b) => a.w.diffDays - b.w.diffDays)
    .map((x) => x.p);

  const greeting = userLabel(user);
  const today = capitalize(FRENCH_DATE.format(new Date()));
  const urgentCount = urgent.length;
  const restCount = plants.length - urgent.length - thisWeek.length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="relative">
        <BotanicalLeaf
          size={120}
          className="absolute -top-2 -right-3 text-moss-500 opacity-30 z-0"
        />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.2em] text-ink-400 font-semibold">{today}</p>
          <H1 className="mt-1">Bonjour {greeting}</H1>
          <p className="mt-1.5 font-sans text-sm text-ink-600">
            <ContextLine count={urgentCount} />
          </p>
        </div>
      </header>

      <div className="filet-h" />

      {plants.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DashboardSections urgent={urgent} thisWeek={thisWeek} />
          {restCount > 0 ? (
            <div className="text-right">
              <Link
                href="/plants"
                className="font-sans text-sm text-terracotta-500 hover:text-terracotta-600 transition-colors"
              >
                Voir toutes mes plantes →
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ContextLine({ count }: { count: number }) {
  if (count === 0) {
    return (
      <>
        <Italic className="text-moss-600">Tout va bien</Italic> aujourd&apos;hui.
      </>
    );
  }
  if (count === 1) {
    return (
      <>
        <Italic className="text-terracotta-500">1 plante</Italic> a soif aujourd&apos;hui.
      </>
    );
  }
  return (
    <>
      <Italic className="text-terracotta-500">{count} plantes</Italic> ont soif aujourd&apos;hui.
    </>
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
          <H3 className="text-ink-800">Pas encore de plante</H3>
          <Body className="mt-1 text-ink-600">Commence par en ajouter une — elle te dira merci.</Body>
        </div>
        <Link href="/plants/new">
          <Button variant="cta" size="md" leadingIcon={<Plus size={18} />}>
            Ajouter ma première plante
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
