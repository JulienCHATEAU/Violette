import { NextResponse } from "next/server";
import { recognize } from "@/lib/recognition";
import { RecognizeInput } from "@/lib/zod-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = RecognizeInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await recognize(parsed.data.imageBase64);
  if (result.source === "none") {
    return NextResponse.json({ suggestions: [], source: "none", message: "unrecognized" }, { status: 200 });
  }
  return NextResponse.json(result);
}
