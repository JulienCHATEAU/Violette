import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushTo } from "@/lib/push/web-push";
import { generatePlantMessage } from "@/lib/push/generate-message";
import { isQuietNow } from "@/lib/push/quiet-hours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECENT_TEMPLATE_WINDOW = 20;

export async function POST(req: Request) {
  const auth = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      plants: true,
      pushSubscriptions: { where: { greetingsEnabled: true } },
    },
  });

  let sent = 0;
  for (const user of users) {
    if (!user.plants.length || !user.pushSubscriptions.length) continue;
    const activeSubs = user.pushSubscriptions.filter(
      (s) => !isQuietNow(s.quietHoursStart, s.quietHoursEnd),
    );
    if (!activeSubs.length) continue;

    const plant = user.plants[Math.floor(Math.random() * user.plants.length)]!;

    const recentTemplates = await prisma.pushMessage.findMany({
      where: { plant: { ownerId: user.id }, kind: "greeting", templateId: { not: null } },
      orderBy: { sentAt: "desc" },
      take: RECENT_TEMPLATE_WINDOW,
      select: { templateId: true },
    });
    const recentIds = recentTemplates
      .map((m) => m.templateId)
      .filter((v): v is string => !!v);

    const msg = generatePlantMessage(plant, "greeting", { recentIds });
    if (!msg) continue;

    const results = await Promise.all(
      activeSubs.map((s) =>
        sendPushTo(s, {
          title: msg.title,
          body: msg.body,
          url: `/plants/${plant.id}`,
          plantId: plant.id,
          tag: `hello-${plant.id}-${Date.now()}`,
        }),
      ),
    );
    if (results.some((r) => r.ok)) {
      sent += 1;
      await prisma.pushMessage.create({
        data: {
          plantId: plant.id,
          kind: "greeting",
          body: `${msg.title} — ${msg.body}`,
          templateId: msg.templateId,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, sent });
}

export const GET = POST;
