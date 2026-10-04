import { requireProfile } from "@/lib/auth/require-profile";
import { OfficeExperience } from "@/components/office/office-experience";
import type { AgentVisualStatus, OfficeRoom } from "@/components/office/types";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function numberValue(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

export default async function CommandCenterPage() {
  const { supabase, profile } = await requireProfile();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [snapshotRes, agentsRes, briefRes] = await Promise.all([
    supabase.rpc("command_center_snapshot", { p_month_start: monthStart }),
    supabase.from("ai_agents")
      .select("id, slug, name, department, status, owner_only")
      .order("department"),
    supabase.from("daily_briefs")
      .select("title, summary, priorities, created_at")
      .eq("profile_id", profile.id)
      .order("brief_date", { ascending: false })
      .limit(1),
  ]);

  const rawSnapshot = snapshotRes.data;
  const snapshot =
    rawSnapshot && typeof rawSnapshot === "object" && !Array.isArray(rawSnapshot)
      ? rawSnapshot as Record<string, unknown>
      : {};

  const orders = numberValue(snapshot, "orders");
  const leads = numberValue(snapshot, "leads");
  const projects = numberValue(snapshot, "projects");
  const approvals = numberValue(snapshot, "approvals");
  const review = numberValue(snapshot, "review");
  const financePending = numberValue(snapshot, "finance_pending");
  const revenue = numberValue(snapshot, "revenue");

  const agentMap = new Map(
    (agentsRes.data ?? []).map((agent) => [
      agent.slug,
      { name: agent.name, status: agent.status as AgentVisualStatus },
    ]),
  );

  const metrics = [
    { label: "Omzet bulan ini", value: rupiah(revenue), note: "Transaksi terverifikasi" },
    { label: "Order aktif", value: String(orders), note: "Produk jadi" },
    { label: "Lead custom", value: String(leads), note: "Pipeline berjalan" },
    { label: "Proyek aktif", value: String(projects), note: "Belum selesai" },
    { label: "Approval", value: String(approvals), note: "Menunggu keputusan" },
  ];

  const rooms: OfficeRoom[] = [
    { id: "sales", name: "Sales Room", href: "/sales", value: leads, label: "lead aktif", agentName: agentMap.get("sales")?.name, agentStatus: agentMap.get("sales")?.status },
    { id: "project", name: "Project Room", href: "/projects", value: projects, label: "proyek aktif", agentName: agentMap.get("project-manager")?.name, agentStatus: agentMap.get("project-manager")?.status },
    { id: "creative", name: "Creative Room", href: "/creative", value: 0, label: "workspace creative", agentName: agentMap.get("creative")?.name, agentStatus: agentMap.get("creative")?.status },
    { id: "finance", name: "Finance Room", href: "/finance", value: financePending, label: "transaksi pending", agentName: agentMap.get("finance")?.name, agentStatus: agentMap.get("finance")?.status },
    { id: "review", name: "Review Room", href: "/review", value: review, label: "antrean review", agentName: agentMap.get("reviewer")?.name, agentStatus: agentMap.get("reviewer")?.status },
    {
      id: "owner",
      name: "Owner Room",
      href: profile.role === "owner" ? "/owner" : "/approval",
      value: approvals,
      label: profile.role === "owner" ? "approval menunggu" : "approval",
      alert: approvals > 0,
      agentName: agentMap.get("developer")?.name,
      agentStatus: agentMap.get("developer")?.status,
    },
  ];

  return (
    <div className="command-page">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">COMMAND CENTER</span>
          <h1>Selamat datang, {profile.full_name?.split(" ")[0] || "Owner"}.</h1>
          <p>
            Kantor AI Teman Digital menyatukan pekerjaan manusia dan pegawai AI
            dalam satu alur yang bisa diaudit.
          </p>
        </div>
        <div className="hero-chip">LIVE OFFICE · SYSTEM ACTIVE</div>
      </section>

      <OfficeExperience rooms={rooms} />

      <section className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="daily-brief panel">
          <div className="panel-heading">
            <div>
              <span className="soft-label">AI CHIEF OF STAFF</span>
              <h2>Daily Brief</h2>
            </div>
            <span className="status-dot">Aktif</span>
          </div>
          <p className="brief-copy">
            {briefRes.data?.[0]?.summary ?? (
              <>
                Saat ini ada <strong>{orders} order</strong>,{" "}
                <strong>{leads} lead custom</strong>,{" "}
                <strong>{projects} proyek aktif</strong>, dan{" "}
                <strong>{approvals} approval</strong> yang perlu dipantau.
              </>
            )}
          </p>
          <div className="brief-priority">
            <span>Prioritas sistem</span>
            <strong>
              {Array.isArray(briefRes.data?.[0]?.priorities) && briefRes.data?.[0]?.priorities.length
                ? String(briefRes.data[0].priorities[0])
                : approvals > 0
                  ? "Tinjau Approval Center terlebih dahulu."
                  : "Belum ada approval tertunda. Fokus pada lead dan proyek aktif."}
            </strong>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="soft-label">REALTIME TEAM</span>
              <h2>Pegawai AI</h2>
            </div>
            <span>{agentsRes.data?.length ?? 0} terlihat</span>
          </div>
          <div className="agent-list">
            {(agentsRes.data ?? []).map((agent) => (
              <div className="agent-row" key={agent.id}>
                <div className="agent-avatar">{agent.name.replace("AI ", "").slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{agent.name}</strong>
                  <span>{agent.department}</span>
                </div>
                <small className={`agent-status status-${agent.status}`}>
                  {statusLabel(agent.status)}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
