import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type NotificationInput = {
  profileId: string;
  title: string;
  body: string;
  level?: Database["public"]["Enums"]["notification_level"];
  link?: string | null;
  key: string;
  ruleId?: string | null;
};

export async function createNotification(
  supabase: SupabaseClient<Database>,
  input: NotificationInput,
) {
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("notification_key", input.key)
    .maybeSingle();

  if (existing) return false;

  const { error } = await supabase.from("notifications").insert({
    profile_id: input.profileId,
    title: input.title,
    body: input.body,
    level: input.level ?? "info",
    link: input.link ?? null,
    notification_key: input.key,
    automation_rule_id: input.ruleId ?? null,
  });

  if (error) {
    if (error.code === "23505") return false;
    throw new Error(error.message);
  }

  return true;
}
