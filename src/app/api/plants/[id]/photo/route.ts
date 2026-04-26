import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function ensureOwned(id: string, userId: string) {
  return prisma.plant.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const plant = await prisma.plant.findFirst({
    where: { id: params.id, ownerId: session.sub },
    select: { photo: true, photoMime: true, updatedAt: true },
  });
  if (!plant || !plant.photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(plant.photo), {
    status: 200,
    headers: {
      "Content-Type": plant.photoMime ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
      ETag: `"${plant.updatedAt.getTime()}"`,
    },
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const owned = await ensureOwned(params.id, session.sub);
  if (!owned) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large", max: MAX_BYTES }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  await prisma.plant.update({
    where: { id: params.id },
    data: { photo: buf, photoMime: file.type },
  });
  return NextResponse.json({ ok: true, bytes: buf.length });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const owned = await ensureOwned(params.id, session.sub);
  if (!owned) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.plant.update({
    where: { id: params.id },
    data: { photo: null, photoMime: null },
  });
  return NextResponse.json({ ok: true });
}
