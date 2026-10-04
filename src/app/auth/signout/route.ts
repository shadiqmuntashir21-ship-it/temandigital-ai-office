import { NextResponse } from "next/server";
import { clearOwnerSession } from "@/lib/auth/owner-session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await clearOwnerSession();

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
