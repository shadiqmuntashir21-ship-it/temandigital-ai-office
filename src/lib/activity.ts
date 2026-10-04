import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

type ActivityInput = {
  actorProfileId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  projectId?: string;
  summary?: string;
  metadata?: Json;
};

export async function writeActivity(
  supabase: SupabaseClient<Database>,
  input: ActivityInput,
) {
  const { error } = await supabase.from("activity_logs").insert({
    actor_type: "human",
    actor_profile_id: input.actorProfileId,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    project_id: input.projectId ?? null,
    summary: input.summary ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Gagal menulis activity log:", error.message);
  }
}
