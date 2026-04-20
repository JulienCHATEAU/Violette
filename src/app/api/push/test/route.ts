import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushTo } from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const subs = await prisma.pushSubscription.findMany();
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
  return NextResponse.json({ sent: results.filter((r) => r.ok).length, total: subs.length, results });
}
