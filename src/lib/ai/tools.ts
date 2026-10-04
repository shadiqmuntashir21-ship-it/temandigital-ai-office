import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AgentSlug, AIActionName, AIActionPayload } from "@/lib/ai/types";
import { canAgentUse } from "@/lib/ai/permissions";

const validSources = ["instagram","tiktok","whatsapp","website","referral","lainnya"] as const;
const validTransactionTypes = ["pemasukan","pengeluaran","dp","pelunasan","refund"] as const;
const validRisks = ["low","medium","high","critical"] as const;

type ToolContext = {
  supabase: SupabaseClient<Database>;
  profileId: string;
  agentId: string;
  agentSlug: AgentSlug;
  projectId?: string | null;
};

type ToolResult = {
  ok: boolean;
  status: "executed" | "approval_requested" | "skipped" | "rejected";
  message: string;
  entityId?: string;
};

function asSource(value?: string): Database["public"]["Enums"]["lead_source"] {
  return validSources.includes(value as (typeof validSources)[number])
    ? value as Database["public"]["Enums"]["lead_source"]
    : "lainnya";
}

function asTransactionType(value?: string): Database["public"]["Enums"]["transaction_type"] {
  return validTransactionTypes.includes(value as (typeof validTransactionTypes)[number])
    ? value as Database["public"]["Enums"]["transaction_type"]
    : "pemasukan";
}

function asRisk(value?: string): Database["public"]["Enums"]["approval_risk"] {
  return validRisks.includes(value as (typeof validRisks)[number])
    ? value as Database["public"]["Enums"]["approval_risk"]
    : "medium";
}

export async function executeAIAction(
  context: ToolContext,
  action: AIActionName,
  payload: AIActionPayload,
): Promise<ToolResult> {
  if (action === "none") {
    return { ok: true, status: "skipped", message: "Tidak ada perubahan data." };
  }

  if (!canAgentUse(context.agentSlug, action)) {
    return {
      ok: false,
      status: "rejected",
      message: `Agent ${context.agentSlug} tidak memiliki izin untuk action ${action}.`,
    };
  }

  if (action === "create_lead") {
    if (!payload.name) return { ok: false, status: "rejected", message: "Nama lead wajib diisi." };

    const { data, error } = await context.supabase.from("leads").insert({
      name: payload.name,
      whatsapp: payload.whatsapp || null,
      email: payload.email || null,
      company: payload.company || null,
      source: asSource(payload.source),
      needs: payload.needs || null,
      budget: payload.budget ?? null,
      ai_summary: "Lead dibuat oleh pegawai AI berdasarkan instruksi pengguna internal.",
      status: "lead_baru",
      assigned_to: context.profileId,
      created_by: context.profileId,
    }).select("id").single();

    if (error) return { ok: false, status: "rejected", message: error.message };
    return { ok: true, status: "executed", entityId: data.id, message: `Lead ${payload.name} berhasil dibuat.` };
  }

  if (action === "create_project_task") {
    if (!payload.project_id || !payload.title) {
      return { ok: false, status: "rejected", message: "project_id dan title wajib diisi untuk membuat task." };
    }

    const priority = Math.max(1, Math.min(4, Math.round(payload.priority ?? 2)));
    const { data, error } = await context.supabase.from("project_tasks").insert({
      project_id: payload.project_id,
      title: payload.title,
      description: payload.description || null,
      priority,
      assignee_agent_id: context.agentId,
      created_by: context.profileId,
    }).select("id").single();

    if (error) return { ok: false, status: "rejected", message: error.message };
    return { ok: true, status: "executed", entityId: data.id, message: `Task "${payload.title}" berhasil dibuat.` };
  }

  if (action === "create_pending_transaction") {
    if (!payload.amount || payload.amount <= 0) {
      return { ok: false, status: "rejected", message: "Nominal transaksi harus lebih dari 0." };
    }

    const { data, error } = await context.supabase.from("transactions").insert({
      project_id: payload.project_id || null,
      type: asTransactionType(payload.transaction_type),
      amount: payload.amount,
      description: payload.description || "Dicatat oleh AI Finance.",
      status: "pending",
      created_by: context.profileId,
    }).select("id").single();

    if (error) return { ok: false, status: "rejected", message: error.message };
    return {
      ok: true,
      status: "executed",
      entityId: data.id,
      message: "Transaksi berhasil dicatat sebagai PENDING. Transaksi belum dianggap uang terverifikasi.",
    };
  }

  const title = payload.title || "Permintaan tindakan dari pegawai AI";
  const summary = payload.summary || payload.description || "Memerlukan keputusan owner.";
  const { data, error } = await context.supabase.from("approvals").insert({
    project_id: payload.project_id || context.projectId || null,
    requester_profile_id: context.profileId,
    requester_agent_id: context.agentId,
    category: payload.category || "sistem",
    risk: asRisk(payload.risk),
    title,
    summary,
    payload,
    status: "menunggu",
  }).select("id").single();

  if (error) return { ok: false, status: "rejected", message: error.message };

  return {
    ok: true,
    status: "approval_requested",
    entityId: data.id,
    message: `Permintaan "${title}" dikirim ke Approval Center dan belum dieksekusi.`,
  };
}
