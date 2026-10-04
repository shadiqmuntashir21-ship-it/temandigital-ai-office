import { requireProfile } from "@/lib/auth/require-profile";
import { OfficeExperience } from "@/components/office/office-experience";
import type { OfficeRoom } from "@/components/office/types";

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
    reviewRes,
    financePendingRes,
    briefRes,
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).neq("status", "dibatalkan"),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["lead_baru", "konsultasi", "penawaran", "menunggu_dp"]),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", '("selesai","dibatalkan")'),
    supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
    supabase.from("transactions").select("amount").eq("status", "terverifikasi").gte("occurred_at", monthStart).in("type", ["pemasukan", "dp", "pelunasan"]),
    supabase.from("ai_agents").select("id, name, department, status, owner_only").order("department"),
    supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["revisi", "handover"]),
    supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("daily_briefs")
      .select("title, summary, priorities, created_at")
      .eq("profile_id", profile.id)
      .order("brief_date", { ascending: false })
      .limit(1),
  ]);

  const revenue = (revenueRes.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const metrics = [
    { label: "Omzet bulan ini", value: rupiah(revenue), note: "Transaksi terverifikasi" },
    { label: "Order aktif", value: String(ordersRes.count ?? 0), note: "Produk jadi" },
    { label: "Lead custom", value: String(leadsRes.count ?? 0), note: "Pipeline berjalan" },
    { label: "Proyek aktif", value: String(projectsRes.count ?? 0), note: "Belum selesai" },
    { label: "Approval", value: String(approvalsRes.count ?? 0), note: "Menunggu keputusan" },
  ];

  const rooms: OfficeRoom[] = [
    { id: "sales", name: "Sales Room", href: "/sales", value: leadsRes.count ?? 0, label: "lead aktif" },
    { id: "project", name: "Project Room", href: "/projects", value: projectsRes.count ?? 0, label: "proyek aktif" },
    { id: "creative", name: "Creative Room", href: "/creative", value: 0, label: "siap menerima brief" },
    { id: "finance", name: "Finance Room", href: "/finance", value: financePendingRes.count ?? 0, label: "transaksi pending" },
    { id: "review", name: "Review Room", href: "/review", value: reviewRes.count ?? 0, label: "antrean review" },
    { id: "owner", name: "Owner Room", href: profile.role === "owner" ? "/owner" : "/approval", value: approvalsRes.count ?? 0, label: profile.role === "owner" ? "approval menunggu" : "approval", alert: (approvalsRes.count ?? 0) > 0 },
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
        <div className="hero-chip">LIVE OFFICE · FOUNDATION ACTIVE</div>
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
                Saat ini ada <strong>{ordersRes.count ?? 0} order</strong>,{" "}
                <strong>{leadsRes.count ?? 0} lead custom</strong>,{" "}
                <strong>{projectsRes.count ?? 0} proyek aktif</strong>, dan{" "}
                <strong>{approvalsRes.count ?? 0} approval</strong> yang perlu dipantau.
              </>
            )}
          </p>
          <div className="brief-priority">
            <span>Prioritas sistem</span>
            <strong>
              {Array.isArray(briefRes.data?.[0]?.priorities) && briefRes.data?.[0]?.priorities.length
                ? String(briefRes.data[0].priorities[0])
                : (approvalsRes.count ?? 0) > 0
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
