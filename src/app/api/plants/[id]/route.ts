import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PlantUpdateInput } from "@/lib/zod-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  const plant = await prisma.plant.findUnique({
    where: { id: params.id },
    include: { wateringLogs: { orderBy: { wateredAt: "desc" }, take: 20 } },
  });
  if (!plant) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ plant });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const json = await req.json().catch(() => null);
  const parsed = PlantUpdateInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const plant = await prisma.plant.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ plant });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    await prisma.plant.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
