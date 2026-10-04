import { requireProfile } from "@/lib/auth/require-profile";
import { decideApproval } from "./actions";
import { tanggal, labelStatus } from "@/lib/format";

export default async function ApprovalPage() {
  const { supabase, profile } = await requireProfile();
  const { data: approvals } = await supabase.from("approvals").select("*, projects(title), ai_agents(name)").order("created_at", { ascending: false }).limit(80);

  return (
    <div className="ops-page">
      <section className="page-heading"><div><span className="eyebrow dark">APPROVAL CENTER</span><h1>Keputusan terkontrol</h1><p>Tindakan sensitif tidak dieksekusi bebas oleh AI. Keputusan owner meninggalkan audit trail.</p></div></section>
      <section className="approval-grid">
        {(approvals ?? []).map((item)=>(
          <article className={`approval-card risk-${item.risk}`} key={item.id}>
            <div className="approval-top"><span className="badge">{item.risk.toUpperCase()}</span><small>{tanggal(item.created_at)}</small></div>
            <h2>{item.title}</h2><p>{item.summary || "Tanpa ringkasan."}</p>
            <div className="approval-context"><span>{item.projects?.title || item.category}</span><strong>{labelStatus(item.status)}</strong></div>
            {profile.role==="owner" && item.status==="menunggu" ? (
              <form action={decideApproval} className="compact-form">
                <input type="hidden" name="id" value={item.id}/><textarea name="decision_note" rows={2} placeholder="Catatan keputusan" />
                <div className="approval-actions"><button name="status" value="ditolak" className="danger-button">Tolak</button><button name="status" value="minta_revisi" className="secondary-button">Minta revisi</button><button name="status" value="disetujui" className="primary-button">Setujui</button></div>
              </form>
            ) : null}
          </article>
        ))}
        {!approvals?.length ? <div className="empty-state">Belum ada approval.</div> : null}
      </section>
    </div>
  );
}
