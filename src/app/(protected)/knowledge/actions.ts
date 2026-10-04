"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";

export async function createKnowledge(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "owner") throw new Error("Hanya owner yang dapat mengubah Knowledge Base.");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return;

  const { data, error } = await supabase.from("knowledge_documents").insert({
    category: String(formData.get("category") ?? "SOP"),
    title,
    content,
    created_by: profile.id,
  }).select("id").single();
  if (error) throw new Error(error.message);
  await writeActivity(supabase, { actorProfileId: profile.id, action: "knowledge.created", entityType: "knowledge_document", entityId: data.id, summary: `Knowledge ${title} ditambahkan.` });
  revalidatePath("/knowledge");
}
