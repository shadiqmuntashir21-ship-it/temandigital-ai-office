"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";
import type { Database } from "@/types/database";

type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export async function decideApproval(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "owner") throw new Error("Hanya owner yang dapat mengambil keputusan approval.");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "minta_revisi") as ApprovalStatus;
  const note = String(formData.get("decision_note") ?? "").trim() || null;

  const { error } = await supabase.from("approvals").update({
    status,
    decision_note: note,
    decided_by: profile.id,
    decided_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(error.message);

  await writeActivity(supabase, { actorProfileId: profile.id, action: "approval.decided", entityType: "approval", entityId: id, summary: `Approval diputuskan: ${status.replaceAll("_"," ")}.` });
  revalidatePath("/approval");
}
