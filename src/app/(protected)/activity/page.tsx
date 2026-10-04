import { requireProfile } from "@/lib/auth/require-profile";
import { tanggal } from "@/lib/format";

export default async function ActivityPage() {
  const { supabase } = await requireProfile();
  const { data: logs } = await supabase.from("activity_logs").select("*, profiles(full_name), ai_agents(name), projects(title)").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="ops-page">
      <section className="page-heading"><div><span className="eyebrow dark">ACTIVITY LOG</span><h1>Jejak aktivitas</h1><p>Log bersifat append-only dari sisi pengguna internal; tidak disediakan aksi edit atau hapus.</p></div></section>
      <section className="timeline">
        {(logs ?? []).map((log)=><article className="timeline-item" key={log.id}><span className="timeline-dot"/><div><div className="timeline-head"><strong>{log.summary || log.action}</strong><small>{tanggal(log.created_at)}</small></div><p>{log.profiles?.full_name || log.ai_agents?.name || "System"} · {log.projects?.title || log.entity_type || "operasional"}</p><span className="badge">{log.action}</span></div></article>)}
        {!logs?.length ? <div className="empty-state">Belum ada aktivitas.</div> : null}
      </section>
    </div>
  );
}
