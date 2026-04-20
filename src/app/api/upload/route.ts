import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/gif"]);

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "file_too_large" }, { status: 413 });

  const type = file.type || "image/jpeg";
  if (!ALLOWED.has(type.toLowerCase())) {
    return NextResponse.json({ error: "unsupported_type", type }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url } = await storage.save(buffer, type);
  return NextResponse.json({ url }, { status: 201 });
}
