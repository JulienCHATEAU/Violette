import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PlantUpdateInput } from "@/lib/zod-schemas";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

async function ownedPlant(id: string, userId: string) {
  return prisma.plant.findFirst({ where: { id, ownerId: userId } });
}

export async function GET(_: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const plant = await prisma.plant.findFirst({
    where: { id: params.id, ownerId: session.sub },
    include: { wateringLogs: { orderBy: { wateredAt: "desc" }, take: 20 } },
  });
  if (!plant) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ plant });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const existing = await ownedPlant(params.id, session.sub);
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = PlantUpdateInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const plant = await prisma.plant.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ plant });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const existing = await ownedPlant(params.id, session.sub);
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await prisma.plant.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
