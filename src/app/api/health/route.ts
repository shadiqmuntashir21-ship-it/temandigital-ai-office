import { NextResponse } from "next/server";
import { createOwnerClient } from "@/lib/supabase/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createOwnerClient();
    const { data: owner, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "owner")
      .eq("is_active", true)
      .single();

    if (error || !owner) {
      return NextResponse.json(
        { ok: false, database: "unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      database: "ready",
      owner: "ready",
    });
  } catch {
    return NextResponse.json(
      { ok: false, database: "unavailable" },
      { status: 503 },
    );
  }
}
