"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";
import type { Database } from "@/types/database";

type TransactionType = Database["public"]["Enums"]["transaction_type"];

export async function createTransaction(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const amount = Number(formData.get("amount") ?? 0);
  if (!amount || amount < 0) return;

  const { data, error } = await supabase.from("transactions").insert({
    project_id: String(formData.get("project_id") ?? "") || null,
    type: String(formData.get("type") ?? "pemasukan") as TransactionType,
    amount,
    description: String(formData.get("description") ?? "").trim() || null,
    reference: String(formData.get("reference") ?? "").trim() || null,
    status: "pending",
    created_by: profile.id,
  }).select("id").single();

  if (error) throw new Error(error.message);
  await writeActivity(supabase, { actorProfileId: profile.id, action: "transaction.created", entityType: "transaction", entityId: data.id, summary: "Transaksi dicatat sebagai pending dan belum dianggap terverifikasi." });
  revalidatePath("/finance");
}

export async function verifyTransaction(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("transactions").update({ status: "terverifikasi", verified_by: profile.id }).eq("id", id);
  if (error) throw new Error(error.message);
  await writeActivity(supabase, { actorProfileId: profile.id, action: "transaction.verified", entityType: "transaction", entityId: id, summary: "Transaksi diverifikasi oleh pengguna internal." });
  revalidatePath("/finance");
}
