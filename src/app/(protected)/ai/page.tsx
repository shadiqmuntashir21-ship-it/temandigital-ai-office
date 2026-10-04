import { AIDesk, type AITaskHistoryItem } from "@/components/ai-desk";
import { requireProfile } from "@/lib/auth/require-profile";
import type { Json } from "@/types/database";

function asRecord(value: Json | null): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export default async function AIPage() {
  const { supabase, profile } = await requireProfile();

  const { data: rows } = await supabase
    .from("ai_tasks")
    .select("id, title, instruction, status, created_at, completed_at, error_message, input, output, ai_agents(slug, name, department)")
    .order("created_at", { ascending: false })
    .limit(30);

  const tasks: AITaskHistoryItem[] = (rows ?? []).map((row) => {
    const output = asRecord(row.output);
    const toolResult = asRecord(output.tool_result as Json | null);
    const agent = row.ai_agents;

    return {
      id: row.id,
      title: row.title,
      instruction: row.instruction,
      status: row.status,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      errorMessage: row.error_message,
      agent: {
        slug: agent?.slug ?? "chief-of-staff",
        name: agent?.name ?? "AI Employee",
        room: agent?.department ?? "Kantor AI",
      },
      reply: asString(output.reply),
      action: asString(output.action),
      toolMessage: asString(toolResult.message),
      routerReason: asString((asRecord(row.input as Json)).router_reason),
    };
  });

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">AI EMPLOYEES</span>
          <h1>Meja kerja AI</h1>
          <p>
            Semua instruksi disimpan sebagai pekerjaan. Pindah menu atau refresh tidak lagi
            menghapus brief, hasil, maupun status pekerjaan AI.
          </p>
        </div>
      </section>
      <AIDesk isOwner={profile.role === "owner"} initialTasks={tasks} />
    </div>
  );
}
