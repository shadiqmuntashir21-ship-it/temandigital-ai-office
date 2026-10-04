import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth/require-profile";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireProfile();
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .is("read_at", null);

  return (
    <AppShell
      userName={profile.full_name || "Tim Teman Digital"}
      role={profile.role}
      unreadCount={unreadCount ?? 0}
    >
      {children}
    </AppShell>
  );
}
