"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";
import type { Database } from "@/types/database";

type LeadSource = Database["public"]["Enums"]["lead_source"];
type LeadStatus = Database["public"]["Enums"]["lead_status"];

export async function createClient(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { data, error } = await supabase.from("clients").insert({
    name,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: profile.id,
  }).select("id").single();

  if (error) throw new Error(error.message);
  await writeActivity(supabase, {
    actorProfileId: profile.id,
    action: "client.created",
    entityType: "client",
    entityId: data.id,
    summary: `Klien ${name} ditambahkan.`,
  });
  revalidatePath("/sales");
}

export async function createLead(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const source = String(formData.get("source") ?? "lainnya") as LeadSource;
  const budgetRaw = String(formData.get("budget") ?? "").trim();

  const { data, error } = await supabase.from("leads").insert({
    name,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    source,
    needs: String(formData.get("needs") ?? "").trim() || null,
    budget: budgetRaw ? Number(budgetRaw) : null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: "lead_baru",
    assigned_to: profile.id,
    created_by: profile.id,
  }).select("id").single();

  if (error) throw new Error(error.message);
  await writeActivity(supabase, {
    actorProfileId: profile.id,
    action: "lead.created",
    entityType: "lead",
    entityId: data.id,
    summary: `Lead ${name} dibuat dari ${source}.`,
  });
  revalidatePath("/sales");
}

export async function updateLeadStatus(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "lead_baru") as LeadStatus;
  if (!id) return;

  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  await writeActivity(supabase, {
    actorProfileId: profile.id,
    action: "lead.status_changed",
    entityType: "lead",
    entityId: id,
    summary: `Status lead diubah menjadi ${status.replaceAll("_", " ")}.`,
  });
  revalidatePath("/sales");
}
