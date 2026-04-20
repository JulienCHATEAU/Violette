import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushTo } from "@/lib/push/web-push";
import { generatePlantMessage } from "@/lib/push/generate-message";
import { isQuietNow } from "@/lib/push/quiet-hours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEDUP_WINDOW_MS = 12 * 60 * 60 * 1000;
const RECENT_TEMPLATE_WINDOW = 20;

export async function POST(req: Request) {
  const auth = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const plants = await prisma.plant.findMany();
  const duePlants = plants.filter(
    (p) => now - p.lastWateredAt.getTime() >= p.wateringFrequencyDays * 86_400_000,
  );

  if (!duePlants.length) return NextResponse.json({ ok: true, due: 0, sent: 0 });

  const dedupSince = new Date(now - DEDUP_WINDOW_MS);
  let sent = 0;

  for (const plant of duePlants) {
    const recent = await prisma.pushMessage.findFirst({
      where: { plantId: plant.id, kind: "watering_due", sentAt: { gte: dedupSince } },
      select: { id: true },
    });
    if (recent) continue;

    const ownerSubs = await prisma.pushSubscription.findMany({
      where: { userId: plant.ownerId, wateringRemindersEnabled: true },
    });
    const activeSubs = ownerSubs.filter((s) => !isQuietNow(s.quietHoursStart, s.quietHoursEnd));
    if (!activeSubs.length) continue;

    const recentTemplates = await prisma.pushMessage.findMany({
      where: { plant: { ownerId: plant.ownerId }, kind: "watering_due", templateId: { not: null } },
      orderBy: { sentAt: "desc" },
      take: RECENT_TEMPLATE_WINDOW,
      select: { templateId: true },
    });
    const recentIds = recentTemplates
      .map((m) => m.templateId)
      .filter((v): v is string => !!v);

    const msg = generatePlantMessage(plant, "watering_due", { recentIds });
    if (!msg) continue;

    const results = await Promise.all(
      activeSubs.map((s) =>
        sendPushTo(s, {
          title: msg.title,
          body: msg.body,
          url: `/plants/${plant.id}`,
          plantId: plant.id,
          tag: `water-${plant.id}`,
        }),
      ),
    );
    const ok = results.some((r) => r.ok);
    if (ok) {
      sent += 1;
      await prisma.pushMessage.create({
        data: {
          plantId: plant.id,
          kind: "watering_due",
          body: `${msg.title} — ${msg.body}`,
          templateId: msg.templateId,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, due: duePlants.length, sent });
}

export const GET = POST;
