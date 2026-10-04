"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";
import type { Database } from "@/types/database";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

export async function updateProject(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const progress = Math.max(0, Math.min(100, Number(formData.get("progress") ?? 0)));
  const status = String(formData.get("status") ?? "berlangsung") as ProjectStatus;

  const { error } = await supabase.from("projects").update({ progress, status }).eq("id", id);
  if (error) throw new Error(error.message);
  await writeActivity(supabase, { actorProfileId: profile.id, action: "project.updated", entityType: "project", entityId: id, projectId: id, summary: `Progres proyek ${progress}% · ${status}.` });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

export async function addTask(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const projectId = String(formData.get("project_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) return;
  const { data, error } = await supabase.from("project_tasks").insert({
    project_id: projectId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    priority: Number(formData.get("priority") ?? 2),
    due_at: String(formData.get("due_at") ?? "") || null,
    assignee_profile_id: profile.id,
    created_by: profile.id,
  }).select("id").single();
  if (error) throw new Error(error.message);
  await writeActivity(supabase, { actorProfileId: profile.id, action: "task.created", entityType: "project_task", entityId: data.id, projectId, summary: `Task ${title} dibuat.` });
  revalidatePath(`/projects/${projectId}`);
}

export async function requestRevision(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const projectId = String(formData.get("project_id") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();
  if (!projectId || !summary) return;

  const { data: project, error: projectError } = await supabase.from("projects").select("title, revision_limit, revision_used").eq("id", projectId).single();
  if (projectError || !project) throw new Error("Proyek tidak ditemukan.");

  if (project.revision_used >= project.revision_limit) {
    const { data: approval, error } = await supabase.from("approvals").insert({
      project_id: projectId,
      requester_profile_id: profile.id,
      category: "scope",
      risk: "medium",
      title: `Revisi tambahan · ${project.title}`,
      summary,
      payload: { reason: "revision_limit_reached", revision_limit: project.revision_limit },
    }).select("id").single();
    if (error) throw new Error(error.message);
    await writeActivity(supabase, { actorProfileId: profile.id, action: "revision.requires_approval", entityType: "approval", entityId: approval.id, projectId, summary: "Batas revisi tercapai; permintaan dialihkan ke Approval Center." });
  } else {
    const revisionNo = project.revision_used + 1;
    const { data: revision, error } = await supabase.from("revisions").insert({
      project_id: projectId,
      revision_no: revisionNo,
      summary,
      details: String(formData.get("details") ?? "").trim() || null,
      requested_by: profile.id,
    }).select("id").single();
    if (error) throw new Error(error.message);
    await supabase.from("projects").update({ revision_used: revisionNo, status: "revisi" }).eq("id", projectId);
    await writeActivity(supabase, { actorProfileId: profile.id, action: "revision.created", entityType: "revision", entityId: revision.id, projectId, summary: `Revisi ke-${revisionNo} dibuat.` });
  }
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/approval");
}
