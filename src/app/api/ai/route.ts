import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runOfficeAI } from "@/lib/ai/orchestrator";
import type { AgentSlug } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAgent(value: unknown): value is AgentSlug {
  return ["chief-of-staff","sales","project-manager","creative","finance","reviewer","developer"].includes(String(value));
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.is_active) {
      return NextResponse.json({ error: "Akun tidak aktif." }, { status: 403 });
    }

    const body = await request.json() as { message?: unknown; agent?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 5000) {
      return NextResponse.json({ error: "Pesan wajib diisi dan maksimal 5.000 karakter." }, { status: 400 });
    }

    const result = await runOfficeAI({
      supabase,
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
      },
      message,
      preferredAgent: isAgent(body.agent) ? body.agent : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada AI Office.";
    console.error("AI Office error:", message);

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "Gemini belum dikonfigurasi pada environment server." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "AI Office gagal memproses permintaan." }, { status: 500 });
  }
}
