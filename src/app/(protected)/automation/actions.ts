"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { runAutomationRule } from "@/lib/automation/engine";

export async function runRuleNow(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "owner") throw new Error("Hanya owner yang dapat menjalankan automasi secara manual.");

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  await runAutomationRule(supabase, slug, "manual");
  revalidatePath("/automation");
  revalidatePath("/kantor");
  revalidatePath("/notifications");
}

export async function toggleRule(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "owner") throw new Error("Hanya owner yang dapat mengubah status automasi.");

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "active" ? "active" : "paused";
  if (!id) return;

  const { error } = await supabase.from("automation_rules").update({ status: next }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/automation");
}
