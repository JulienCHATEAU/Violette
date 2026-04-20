import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PushSubscribeInput } from "@/lib/zod-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = PushSubscribeInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const { subscription, userAgent, prefs } = parsed.data;

  const row = await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ?? null,
      ...prefs,
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ?? null,
      ...prefs,
    },
  });

  return NextResponse.json({ id: row.id }, { status: 201 });
}
