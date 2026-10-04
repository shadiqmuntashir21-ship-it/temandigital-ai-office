"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";
import type { Database } from "@/types/database";

type ServiceType = Database["public"]["Enums"]["service_type"];

export async function createProject(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const clientId = String(formData.get("client_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const serviceType = String(formData.get("service_type") ?? "web_custom") as ServiceType;
  if (!clientId || !title) return;

  const revisionLimit = serviceType === "web_custom" ? 10 : 5;
  const agreedValue = Number(String(formData.get("agreed_value") ?? "0")) || null;

  const { data, error } = await supabase.from("projects").insert({
    client_id: clientId,
    title,
    service_type: serviceType,
    status: "baru",
    brief: String(formData.get("brief") ?? "").trim() || null,
    deadline: String(formData.get("deadline") ?? "") || null,
    revision_limit: revisionLimit,
    agreed_value: agreedValue,
    owner_id: profile.id,
    created_by: profile.id,
  }).select("id").single();

  if (error) throw new Error(error.message);
  await writeActivity(supabase, {
    actorProfileId: profile.id,
    action: "project.created",
    entityType: "project",
    entityId: data.id,
    projectId: data.id,
    summary: `Proyek ${title} dibuat.`,
  });
  revalidatePath("/projects");
}
