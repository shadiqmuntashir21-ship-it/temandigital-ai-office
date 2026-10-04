import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createOwnerClient } from "@/lib/supabase/owner";
import { hasValidOwnerSession } from "@/lib/auth/owner-session";

export async function getProfileContext() {
  if (await hasValidOwnerSession()) {
    const supabase = createOwnerClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, department, is_active")
      .eq("role", "owner")
      .eq("is_active", true)
      .single();

    if (!error && profile) {
      return {
        supabase,
        profile,
        claims: {
          sub: profile.id,
          role: "owner",
          owner: true,
        },
      };
    }
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, department, is_active")
    .eq("id", userId)
    .single();

  if (error || !profile?.is_active) {
    await supabase.auth.signOut();
    return null;
  }

  return { supabase, profile, claims: data.claims };
}

export async function requireProfile() {
  const context = await getProfileContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}
