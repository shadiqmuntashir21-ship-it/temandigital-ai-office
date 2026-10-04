import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSmokeToken(request: Request) {
  const secret = process.env.OWNER_SESSION_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const ts = url.searchParams.get("ts");
  const token = url.searchParams.get("token");

  if (!ts || !token) return false;

  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp)) return false;

  const age = Math.abs(Date.now() - timestamp);
  if (age > 5 * 60 * 1000) return false;

  const expected = createHmac("sha256", secret)
    .update(`ai-smoke:${ts}`)
    .digest("base64url");

  const left = Buffer.from(token);
  const right = Buffer.from(expected);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  if (!validSmokeToken(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const started = Date.now();

  try {
    const provider = getAIProvider();
    const answer = await provider.generateText({
      system: "Anda adalah AI Creative Teman Digital. Jawab sangat singkat dan jangan menjalankan tool.",
      prompt: "Balas dengan kalimat: AI Creative aktif dan siap bekerja.",
    });

    return NextResponse.json({
      ok: true,
      provider: process.env.AI_PROVIDER || "gemini",
      model: process.env.GEMINI_MODEL || null,
      latency_ms: Date.now() - started,
      answer: answer.slice(0, 180),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI smoke test gagal.";
    console.error("AI smoke test error:", message);

    return NextResponse.json({
      ok: false,
      latency_ms: Date.now() - started,
      error: message.slice(0, 220),
    }, { status: 500 });
  }
}
