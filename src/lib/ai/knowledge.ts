import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function buildKnowledgeContext(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("category, title, content, version")
    .eq("is_active", true)
    .order("category")
    .limit(30);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((doc) => doc.content)
    .map((doc) => `[${doc.category}] ${doc.title} (v${doc.version})\n${doc.content}`)
    .join("\n\n");
}
