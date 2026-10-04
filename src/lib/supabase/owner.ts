import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createOwnerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const guard = process.env.OWNER_DB_GUARD;

  if (!url || !publishableKey || !guard) {
    throw new Error("Konfigurasi owner server belum lengkap.");
  }

  return createClient<Database>(url, publishableKey, {
    global: {
      headers: {
        "x-owner-guard": guard,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
