import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ note: z.string().max(500).optional() }).optional();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const now = new Date();
  try {
    const plant = await prisma.plant.update({
      where: { id: params.id },
      data: {
        lastWateredAt: now,
        wateringLogs: { create: { wateredAt: now, note: parsed.data?.note } },
      },
    });
    const nextWateringAt = new Date(now.getTime() + plant.wateringFrequencyDays * 86_400_000);
    return NextResponse.json({ plant, nextWateringAt });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
