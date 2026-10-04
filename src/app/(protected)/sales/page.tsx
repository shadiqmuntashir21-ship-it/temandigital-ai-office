import { requireProfile } from "@/lib/auth/require-profile";
import { createClient, createLead, updateLeadStatus } from "./actions";
import { rupiah, tanggal, labelStatus } from "@/lib/format";

const statuses = ["lead_baru","konsultasi","penawaran","menunggu_dp","deal","tidak_jadi"] as const;

export default async function SalesPage() {
  const { supabase } = await requireProfile();
  const [{ data: leads }, { data: clients }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(30),
  ]);

  const active = (leads ?? []).filter((lead) => !["deal","tidak_jadi"].includes(lead.status)).length;
  const deal = (leads ?? []).filter((lead) => lead.status === "deal").length;

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">SALES ROOM</span>
          <h1>Lead dan klien</h1>
          <p>Pipeline custom dari Instagram, TikTok, WhatsApp, website, referral, dan sumber lainnya.</p>
        </div>
        <div className="heading-kpis">
          <span><strong>{leads?.length ?? 0}</strong>Total lead</span>
          <span><strong>{active}</strong>Aktif</span>
          <span><strong>{deal}</strong>Deal</span>
        </div>
      </section>

      <section className="ops-split">
        <article className="data-panel">
          <div className="data-panel-head"><div><span className="soft-label">PIPELINE</span><h2>Lead terbaru</h2></div></div>
          <div className="record-list">
            {(leads ?? []).map((lead) => (
              <div className="record-card" key={lead.id}>
                <div className="record-main">
                  <strong>{lead.name}</strong>
                  <span>{lead.company || lead.whatsapp || lead.email || "Tanpa kontak tambahan"}</span>
                  <p>{lead.needs || "Kebutuhan belum dicatat."}</p>
                </div>
                <div className="record-meta">
                  <span className="badge">{labelStatus(lead.source)}</span>
                  <strong>{lead.budget ? rupiah(lead.budget) : "Budget belum ada"}</strong>
                  <small>{tanggal(lead.created_at)}</small>
                </div>
                <form action={updateLeadStatus} className="inline-form">
                  <input type="hidden" name="id" value={lead.id} />
                  <select name="status" defaultValue={lead.status}>
                    {statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
                  </select>
                  <button className="mini-button" type="submit">Simpan</button>
                </form>
              </div>
            ))}
            {!leads?.length ? <div className="empty-state">Belum ada lead. Tambahkan lead pertama dari formulir di samping.</div> : null}
          </div>
        </article>

        <aside className="form-panel">
          <span className="soft-label">LEAD BARU</span>
          <h2>Catat calon klien</h2>
          <form action={createLead} className="compact-form">
            <input name="name" placeholder="Nama calon klien" required />
            <div className="form-row"><input name="whatsapp" placeholder="WhatsApp" /><input name="email" type="email" placeholder="Email" /></div>
            <input name="company" placeholder="Perusahaan / instansi" />
            <select name="source" defaultValue="whatsapp">
              <option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
              <option value="whatsapp">WhatsApp</option><option value="website">Website</option>
              <option value="referral">Referral</option><option value="lainnya">Lainnya</option>
            </select>
            <input name="budget" type="number" min="0" placeholder="Budget (opsional)" />
            <textarea name="needs" placeholder="Kebutuhan calon klien" rows={4} />
            <textarea name="notes" placeholder="Catatan internal" rows={3} />
            <button className="primary-button" type="submit">Tambah lead</button>
          </form>
        </aside>
      </section>

      <section className="data-panel section-gap">
        <div className="data-panel-head">
          <div><span className="soft-label">CLIENT DATABASE</span><h2>Klien</h2></div>
          <details className="inline-details"><summary>Tambah klien</summary>
            <form action={createClient} className="compact-form details-form">
              <input name="name" placeholder="Nama klien" required /><input name="company" placeholder="Perusahaan" />
              <div className="form-row"><input name="whatsapp" placeholder="WhatsApp" /><input name="email" type="email" placeholder="Email" /></div>
              <textarea name="notes" placeholder="Catatan" rows={2} />
              <button className="primary-button" type="submit">Simpan klien</button>
            </form>
          </details>
        </div>
        <div className="simple-table">
          <div className="table-row table-head"><span>Nama</span><span>Kontak</span><span>Perusahaan</span><span>Dibuat</span></div>
          {(clients ?? []).map((client) => (
            <div className="table-row" key={client.id}>
              <strong>{client.name}</strong><span>{client.whatsapp || client.email || "—"}</span><span>{client.company || "—"}</span><span>{tanggal(client.created_at)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
