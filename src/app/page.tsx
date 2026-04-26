import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeWatering } from "@/lib/watering";
import { getSession } from "@/lib/auth/session";
import { PlantList } from "@/components/PlantList";
import type { PlantCardData } from "@/components/PlantCard";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { H1, H3, Body, Italic } from "@/design-system/components/Typography";
import { Droplet, Leaf, PlantPot, Plus, Settings } from "@/design-system/icons";

export const dynamic = "force-dynamic";

/**
 * Dashboard — the home screen after login.
 *
 * Laws of UX:
 *  - Hick's Law: only two sections (À arroser / Cette semaine) instead of three.
 *  - Miller's Law: a 2-column grid keeps each section under the 7±2 chunk limit.
 *  - Aesthetic-Usability Effect: organic cards, paper texture on the empty state,
 *    personified subtitle and bubbles.
 *
 * Stays a server component: Prisma fetch and watering computation run on the
 * server. The interactive grid is delegated to `<PlantList>` (client).
 */
export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plants = await prisma.plant.findMany({
    where: { ownerId: session.sub },
    orderBy: { createdAt: "desc" },
    omit: { photo: true },
  });

  const withStatus = plants.map((p) => ({ p, w: computeWatering(p.lastWateredAt, p.wateringFrequencyDays) }));
  const urgent: PlantCardData[] = withStatus
    .filter((x) => x.w.status === "overdue" || x.w.status === "due")
    .map((x) => x.p);
  const thisWeek: PlantCardData[] = withStatus
    .filter((x) => x.w.status === "soon" || (x.w.status === "ok" && x.w.diffDays <= 7))
    .map((x) => x.p);

  // Single global bubble budget shared across both sections, urgent plants get priority.
  const totalVisible = urgent.length + thisWeek.length;
  const bubbleBudget = Math.floor(totalVisible * 0.3);
  const urgentBudget = Math.min(urgent.length, bubbleBudget);
  const weekBudget = Math.max(0, bubbleBudget - urgentBudget);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <H1 className="text-ink-800">Violette</H1>
          <p className="mt-1 font-serif italic text-ink-600 text-base">
            <Italic className="text-ink-600">Bonjour, voici tes plantes.</Italic>
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="Réglages"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
        >
          <Settings size={20} />
        </Link>
      </header>

      {plants.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {urgent.length > 0 ? (
            <SectionHeader icon={<Droplet size={18} className="text-terracotta-500" />} title="À arroser" count={urgent.length}>
              <PlantList plants={urgent} bubbleBudget={urgentBudget} />
            </SectionHeader>
          ) : null}

          {thisWeek.length > 0 ? (
            <SectionHeader icon={<Leaf size={18} className="text-moss-500" />} title="Cette semaine" count={thisWeek.length}>
              <PlantList plants={thisWeek} bubbleBudget={weekBudget} indexOffset={urgent.length} />
            </SectionHeader>
          ) : null}

          {plants.length > urgent.length + thisWeek.length ? (
            <div className="text-right">
              <Link href="/plants" className="font-sans text-sm text-terracotta-500 hover:text-terracotta-600 transition-colors">
                Voir toutes mes plantes →
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <H3 className="text-ink-800">
          {title} <span className="font-sans text-sm font-medium text-ink-400">({count})</span>
        </H3>
      </div>
      {children}
    </section>
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
