import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";

export default async function OwnerRoomPage() {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "owner") redirect("/kantor");

  const [{ data: developer }, { count: approvals }] = await Promise.all([
    supabase.from("ai_agents").select("name, status, capabilities, guardrails").eq("slug", "developer").single(),
    supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
  ]);

  return (
    <div className="owner-room">
      <section className="owner-hero">
        <span className="eyebrow">OWNER ROOM · PRIVATE</span>
        <h1>Kontrol teknis dan keputusan sensitif.</h1>
        <p>Area ini hanya bisa dibaca owner. AI Developer dilindungi pada backend/RLS, bukan sekadar disembunyikan dari menu.</p>
      </section>

      <section className="owner-grid">
        <article className="owner-card featured">
          <span className="soft-label">AI DEVELOPER</span>
          <h2>{developer?.name ?? "AI Developer"}</h2>
          <strong>{developer?.status?.replaceAll("_", " ") ?? "tersedia"}</strong>
          <p>Coding, audit bug, database, integrasi, deployment, security, log, dan performance.</p>
        </article>
        <article className="owner-card">
          <span className="soft-label">APPROVAL</span>
          <h2>{approvals ?? 0}</h2>
          <p>Keputusan menunggu owner.</p>
        </article>
        <article className="owner-card">
          <span className="soft-label">SYSTEM HEALTH</span>
          <h2>Online</h2>
          <p>Supabase tersambung melalui server-side authenticated client.</p>
        </article>
      </section>
    </div>
  );
}
