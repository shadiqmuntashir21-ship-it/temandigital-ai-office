import { NextResponse } from "next/server";
import { getProfileContext } from "@/lib/auth/require-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getProfileContext();

  if (!context) {
    return NextResponse.json({ unread: 0 }, { status: 401 });
  }

  const { supabase, profile } = context;
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .is("read_at", null);

  if (error) {
    return NextResponse.json({ unread: 0 }, { status: 200 });
  }

  return NextResponse.json({ unread: count ?? 0 });
}
