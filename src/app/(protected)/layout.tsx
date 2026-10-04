import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth/require-profile";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  return (
    <AppShell
      userName={profile.full_name || "Tim Teman Digital"}
      role={profile.role}
    >
      {children}
    </AppShell>
  );
}
