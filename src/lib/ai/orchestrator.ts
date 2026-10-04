import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { AgentPlan, AgentSlug, RouterDecision } from "@/lib/ai/types";
import { getAIProvider } from "@/lib/ai/provider";
import { agentDefinitions, routerSystem } from "@/lib/ai/agents";
import { agentPlanSchema, routerSchema } from "@/lib/ai/schemas";
import { buildKnowledgeContext } from "@/lib/ai/knowledge";
import { permittedActions } from "@/lib/ai/permissions";
import { executeAIAction } from "@/lib/ai/tools";

type RunInput = {
  supabase: SupabaseClient<Database>;
  profile: { id: string; role: "owner" | "staff"; full_name: string | null };
  message: string;
  preferredAgent?: AgentSlug;
};

function isAgentSlug(value: unknown): value is AgentSlug {
  return ["chief-of-staff","sales","project-manager","creative","finance","reviewer","developer"].includes(String(value));
}

export async function runOfficeAI(input: RunInput) {
  const provider = getAIProvider();
  const knowledge = await buildKnowledgeContext(input.supabase);

  let selectedSlug: AgentSlug = input.preferredAgent || "chief-of-staff";
  let routerReason = "Agent dipilih oleh pengguna.";

  if (!input.preferredAgent) {
    try {
      const decision = await provider.generateStructured<RouterDecision>({
        system: routerSystem,
        prompt: `Role pengguna: ${input.profile.role}.\nPermintaan: ${input.message}`,
        schema: routerSchema,
      });

      if (isAgentSlug(decision.agent_slug)) selectedSlug = decision.agent_slug;
      routerReason = decision.reason;
    } catch {
      selectedSlug = "chief-of-staff";
      routerReason = "AI Router gagal merespons; pekerjaan diamankan ke Chief of Staff.";
    }
  }

  if (selectedSlug === "developer" && input.profile.role !== "owner") {
    selectedSlug = "chief-of-staff";
    routerReason = "AI Developer owner-only; permintaan dialihkan ke Chief of Staff.";
  }

  const { data: agent, error: agentError } = await input.supabase
    .from("ai_agents")
    .select("id, slug, name, department, owner_only")
    .eq("slug", selectedSlug)
    .single();

  if (agentError || !agent) {
    throw new Error("Agent tidak tersedia untuk akun ini.");
  }

  const definition = agentDefinitions[selectedSlug];
  const startedAt = new Date().toISOString();

  const { data: aiTask, error: taskError } = await input.supabase.from("ai_tasks").insert({
    agent_id: agent.id,
    title: input.message.slice(0, 120),
    instruction: input.message,
    status: "berjalan",
    risk: selectedSlug === "developer" ? "high" : "low",
    owner_only: agent.owner_only,
    input: { source: "office_chat", router_reason: routerReason },
    created_by: input.profile.id,
    started_at: startedAt,
  }).select("id").single();

  if (taskError) throw new Error(taskError.message);

  await input.supabase
    .from("ai_agents")
    .update({ status: "sedang_bekerja" })
    .eq("id", agent.id);

  try {
    if (selectedSlug !== "chief-of-staff") {
      const { data: chief } = await input.supabase
        .from("ai_agents")
        .select("id")
        .eq("slug", "chief-of-staff")
        .single();

      if (chief) {
        await input.supabase.from("ai_handoffs").insert({
          ai_task_id: aiTask.id,
          from_agent_id: chief.id,
          to_agent_id: agent.id,
          reason: routerReason,
          context: { message: input.message.slice(0, 500) },
        });
      }
    }

    const actions = permittedActions(selectedSlug);
    const system = `
Anda adalah ${definition.label} di Kantor AI Teman Digital.
Ruangan: ${definition.room}.
Misi: ${definition.mission}

Aturan keras:
${definition.rules.map((rule) => `- ${rule}`).join("\n")}

Action yang benar-benar tersedia untuk Anda:
${actions.map((action) => `- ${action}`).join("\n")}

Jika pengguna meminta tindakan di luar izin atau tindakan sensitif, gunakan request_approval.
Jangan mengarang harga, SOP, status pembayaran, atau fakta internal bila Knowledge Base tidak mendukungnya.
Gunakan Bahasa Indonesia yang natural, ringkas, dan operasional.
Action create_pending_transaction hanya mencatat PENDING, bukan menyatakan uang sudah terverifikasi.
AI Developer tidak boleh mengeksekusi deploy/migration/delete/env/security secara langsung; gunakan request_approval.
Kembalikan output sesuai schema.
`.trim();

    const plan = await provider.generateStructured<AgentPlan>({
      system,
      prompt: `KNOWLEDGE BASE:\n${knowledge || "(belum ada dokumen)"}\n\nPERMINTAAN:\n${input.message}`,
      schema: agentPlanSchema,
    });

    const safeAction = actions.includes(plan.action) ? plan.action : "none";
    const toolResult = await executeAIAction(
      {
        supabase: input.supabase,
        profileId: input.profile.id,
        agentId: agent.id,
        agentSlug: selectedSlug,
      },
      safeAction,
      plan.action_payload || {},
    );

    const taskStatus: Database["public"]["Enums"]["ai_task_status"] =
      toolResult.status === "approval_requested"
        ? "menunggu_approval"
        : toolResult.ok
          ? "selesai"
          : "gagal";

    const output: Json = {
      reply: plan.reply,
      action: safeAction,
      action_reason: plan.action_reason,
      tool_result: toolResult,
      agent: { slug: selectedSlug, name: agent.name },
    };

    await Promise.all([
      input.supabase.from("ai_tasks").update({
        status: taskStatus,
        output,
        error_message: toolResult.ok ? null : toolResult.message,
        completed_at: taskStatus === "menunggu_approval" ? null : new Date().toISOString(),
      }).eq("id", aiTask.id),
      input.supabase.from("ai_agents").update({
        status: taskStatus === "menunggu_approval" ? "review" : "tersedia",
      }).eq("id", agent.id),
      input.supabase.from("activity_logs").insert({
        actor_type: "ai",
        actor_agent_id: agent.id,
        action: safeAction === "none" ? "ai.responded" : `ai.${safeAction}`,
        entity_type: toolResult.entityId ? "ai_action_result" : "ai_task",
        entity_id: toolResult.entityId || aiTask.id,
        summary: toolResult.status === "skipped" ? `${agent.name} memberi respons.` : toolResult.message,
        metadata: { ai_task_id: aiTask.id, router_reason: routerReason },
      }),
    ]);

    return {
      taskId: aiTask.id,
      status: taskStatus,
      agent: { slug: selectedSlug, name: agent.name, room: definition.room },
      routerReason,
      reply: plan.reply,
      action: safeAction,
      toolResult,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pegawai AI gagal memproses pekerjaan.";

    await Promise.allSettled([
      input.supabase.from("ai_tasks").update({
        status: "gagal",
        error_message: message.slice(0, 800),
        completed_at: new Date().toISOString(),
      }).eq("id", aiTask.id),
      input.supabase.from("ai_agents").update({
        status: "perlu_perhatian",
      }).eq("id", agent.id),
      input.supabase.from("activity_logs").insert({
        actor_type: "ai",
        actor_agent_id: agent.id,
        action: "ai.failed",
        entity_type: "ai_task",
        entity_id: aiTask.id,
        summary: `${agent.name} gagal memproses pekerjaan.`,
        metadata: { ai_task_id: aiTask.id, router_reason: routerReason },
      }),
    ]);

    throw error;
  }
}
