import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireProfile() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, department, is_active")
    .eq("id", userId)
    .single();

  if (error || !profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=Akun%20tidak%20aktif%20atau%20belum%20terdaftar");
  }

  return { supabase, profile, claims: data.claims };
}
