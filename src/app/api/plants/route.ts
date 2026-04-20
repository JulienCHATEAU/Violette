import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PlantCreateInput } from "@/lib/zod-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const plants = await prisma.plant.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ plants });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = PlantCreateInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const plant = await prisma.plant.create({ data: parsed.data });
  return NextResponse.json({ plant }, { status: 201 });
}
