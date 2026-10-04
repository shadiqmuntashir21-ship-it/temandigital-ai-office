import { requireProfile } from "@/lib/auth/require-profile";
import { createTransaction, verifyTransaction } from "./actions";
import { rupiah, tanggal, labelStatus } from "@/lib/format";

export default async function FinancePage() {
  const { supabase } = await requireProfile();
  const [{ data: transactions }, { data: projects }] = await Promise.all([
    supabase.from("transactions").select("*, projects(title)").order("occurred_at", { ascending: false }).limit(80),
    supabase.from("projects").select("id, title").not("status", "eq", "dibatalkan").order("title"),
  ]);
  const verified = (transactions ?? []).filter((t)=>t.status==="terverifikasi");
  const income = verified.filter((t)=>["pemasukan","dp","pelunasan"].includes(t.type)).reduce((s,t)=>s+Number(t.amount),0);
  const expense = verified.filter((t)=>t.type==="pengeluaran").reduce((s,t)=>s+Number(t.amount),0);

  return (
    <div className="ops-page">
      <section className="page-heading"><div><span className="eyebrow dark">FINANCE ROOM</span><h1>Keuangan</h1><p>Nominal baru masuk ke laporan setelah transaksi berstatus terverifikasi.</p></div><div className="heading-kpis"><span><strong>{rupiah(income)}</strong>Pemasukan</span><span><strong>{rupiah(expense)}</strong>Pengeluaran</span></div></section>
      <section className="ops-split">
        <article className="data-panel">
          <div className="record-list">
            {(transactions ?? []).map((tx)=>(
              <div className="record-card" key={tx.id}>
                <div className="record-main"><strong>{rupiah(tx.amount)} · {labelStatus(tx.type)}</strong><span>{tx.projects?.title || "Umum"}</span><p>{tx.description || tx.reference || "Tanpa catatan"}</p></div>
                <div className="record-meta"><span className="badge">{labelStatus(tx.status)}</span><small>{tanggal(tx.occurred_at)}</small></div>
                {tx.status==="pending" ? <form action={verifyTransaction} className="inline-form"><input type="hidden" name="id" value={tx.id}/><button className="mini-button" type="submit">Verifikasi</button></form> : null}
              </div>
            ))}
            {!transactions?.length ? <div className="empty-state">Belum ada transaksi.</div> : null}
          </div>
        </article>
        <aside className="form-panel"><span className="soft-label">CATAT TRANSAKSI</span><h2>Transaksi baru</h2>
          <form action={createTransaction} className="compact-form">
            <select name="type" defaultValue="pemasukan"><option value="pemasukan">Pemasukan</option><option value="pengeluaran">Pengeluaran</option><option value="dp">DP</option><option value="pelunasan">Pelunasan</option><option value="refund">Refund</option></select>
            <input name="amount" type="number" min="1" placeholder="Nominal" required />
            <select name="project_id" defaultValue=""><option value="">Tanpa proyek</option>{(projects ?? []).map((p)=><option key={p.id} value={p.id}>{p.title}</option>)}</select>
            <input name="reference" placeholder="Referensi / bukti" /><textarea name="description" rows={3} placeholder="Keterangan" />
            <button className="primary-button" type="submit">Catat sebagai pending</button>
          </form>
        </aside>
      </section>
    </div>
  );
}
