import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushTo } from "@/lib/push/web-push";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const subs = await prisma.pushSubscription.findMany({ where: { userId: session.sub } });
  if (!subs.length) return NextResponse.json({ error: "no_subscriptions" }, { status: 404 });

  const results = await Promise.all(
    subs.map((s) =>
      sendPushTo(s, {
        title: "Test Violette 🌿",
        body: "Si tu lis ça, les notifs fonctionnent !",
        url: "/",
      }),
    ),
  );
  return NextResponse.json({ sent: results.filter((r) => r.ok).length, total: subs.length });
}
