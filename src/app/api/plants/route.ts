import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PlantCreateInput } from "@/lib/zod-schemas";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANT_LIMIT = 20;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const plants = await prisma.plant.findMany({
    where: { ownerId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ plants });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const total = await prisma.plant.count();
  if (total >= PLANT_LIMIT) {
    return NextResponse.json(
      { error: "plant_limit_reached", limit: PLANT_LIMIT },
      { status: 403 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = PlantCreateInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const plant = await prisma.plant.create({ data: { ...parsed.data, ownerId: session.sub } });
  return NextResponse.json({ plant }, { status: 201 });
}
