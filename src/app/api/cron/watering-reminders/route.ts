import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushTo } from "@/lib/push/web-push";
import { generatePlantMessage } from "@/lib/push/generate-message";
import { isQuietNow } from "@/lib/push/quiet-hours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEDUP_WINDOW_MS = 12 * 60 * 60 * 1000; // 12h

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

  const subs = await prisma.pushSubscription.findMany({ where: { wateringRemindersEnabled: true } });
  const activeSubs = subs.filter((s) => !isQuietNow(s.quietHoursStart, s.quietHoursEnd));

  if (!activeSubs.length) return NextResponse.json({ ok: true, due: duePlants.length, sent: 0, reason: "quiet_hours" });

  const dedupSince = new Date(now - DEDUP_WINDOW_MS);
  let sent = 0;

  for (const plant of duePlants) {
    const recent = await prisma.pushMessage.findFirst({
      where: { plantId: plant.id, kind: "watering_due", sentAt: { gte: dedupSince } },
      select: { id: true },
    });
    if (recent) continue;

    const { title, body, source } = await generatePlantMessage(plant, "watering_due");

    const results = await Promise.all(
      activeSubs.map((s) =>
        sendPushTo(s, {
          title,
          body,
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
        data: { plantId: plant.id, kind: "watering_due", body: `${title} — ${body}`, source },
      });
    }
  }

  return NextResponse.json({ ok: true, due: duePlants.length, sent });
}

// Vercel Cron uses GET; allow both
export const GET = POST;
