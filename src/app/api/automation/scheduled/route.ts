import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAutomationCadence } from "@/lib/automation/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.AUTOMATION_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const cadence = url.searchParams.get("cadence");

  if (cadence !== "hourly" && cadence !== "daily") {
    return NextResponse.json({ error: "cadence harus hourly atau daily." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const results = await runAutomationCadence(supabase, cadence);
    return NextResponse.json({ ok: true, cadence, results });
  } catch (error) {
    console.error("Scheduled automation error:", error);
    return NextResponse.json({ error: "Scheduled automation gagal." }, { status: 500 });
  }
}
