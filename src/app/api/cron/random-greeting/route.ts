import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushTo } from "@/lib/push/web-push";
import { generatePlantMessage } from "@/lib/push/generate-message";
import { isQuietNow } from "@/lib/push/quiet-hours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const plants = await prisma.plant.findMany();
  if (!plants.length) return NextResponse.json({ ok: true, reason: "no_plants" });

  const subs = await prisma.pushSubscription.findMany({ where: { greetingsEnabled: true } });
  const activeSubs = subs.filter((s) => !isQuietNow(s.quietHoursStart, s.quietHoursEnd));
  if (!activeSubs.length) return NextResponse.json({ ok: true, reason: "no_active_subs" });

  const plant = plants[Math.floor(Math.random() * plants.length)]!;
  const { title, body, source } = await generatePlantMessage(plant, "greeting");

  const results = await Promise.all(
    activeSubs.map((s) =>
      sendPushTo(s, {
        title,
        body,
        url: `/plants/${plant.id}`,
        plantId: plant.id,
        tag: `hello-${plant.id}-${Date.now()}`,
      }),
    ),
  );
  const sentCount = results.filter((r) => r.ok).length;

  if (sentCount > 0) {
    await prisma.pushMessage.create({
      data: { plantId: plant.id, kind: "greeting", body: `${title} — ${body}`, source },
    });
  }

  return NextResponse.json({ ok: true, plant: plant.id, sent: sentCount });
}

export const GET = POST;
