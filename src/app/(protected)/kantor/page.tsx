import { requireProfile } from "@/lib/auth/require-profile";

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

export default async function CommandCenterPage() {
  const { supabase, profile } = await requireProfile();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [
    ordersRes,
    leadsRes,
    projectsRes,
    approvalsRes,
    revenueRes,
    agentsRes,
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).neq("status", "dibatalkan"),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["lead_baru", "konsultasi", "penawaran", "menunggu_dp"]),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", '("selesai","dibatalkan")'),
    supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
    supabase.from("transactions").select("amount").eq("status", "terverifikasi").gte("occurred_at", monthStart).in("type", ["pemasukan", "dp", "pelunasan"]),
    supabase.from("ai_agents").select("id, name, department, status, owner_only").order("department"),
  ]);

  const revenue = (revenueRes.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const metrics = [
    { label: "Omzet bulan ini", value: rupiah(revenue), note: "Transaksi terverifikasi" },
    { label: "Order aktif", value: String(ordersRes.count ?? 0), note: "Produk jadi" },
    { label: "Lead custom", value: String(leadsRes.count ?? 0), note: "Pipeline berjalan" },
    { label: "Proyek aktif", value: String(projectsRes.count ?? 0), note: "Belum selesai" },
    { label: "Approval", value: String(approvalsRes.count ?? 0), note: "Menunggu keputusan" },
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
        <div className="hero-chip">PHASE A · FOUNDATION</div>
      </section>

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
            Saat ini ada <strong>{ordersRes.count ?? 0} order</strong>,{" "}
            <strong>{leadsRes.count ?? 0} lead custom</strong>,{" "}
            <strong>{projectsRes.count ?? 0} proyek aktif</strong>, dan{" "}
            <strong>{approvalsRes.count ?? 0} approval</strong> yang perlu dipantau.
          </p>
          <div className="brief-priority">
            <span>Prioritas sistem</span>
            <strong>
              {(approvalsRes.count ?? 0) > 0
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
