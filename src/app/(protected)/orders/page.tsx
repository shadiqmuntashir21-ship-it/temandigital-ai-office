import { requireProfile } from "@/lib/auth/require-profile";
import { createOrder, updateOrder } from "./actions";
import { rupiah, tanggal, labelStatus } from "@/lib/format";

const orderStatuses = ["menunggu_pembayaran","dibayar","diproses","akses_dikirim","aktif","selesai","dibatalkan"] as const;
const paymentStatuses = ["belum_bayar","dp","lunas","gagal","refund"] as const;

export default async function OrdersPage() {
  const { supabase } = await requireProfile();
  const [{ data: products }, { data: orders }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("price"),
    supabase.from("orders").select("*, products(name)").order("created_at", { ascending: false }).limit(60),
  ]);

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div><span className="eyebrow dark">PRODUK JADI</span><h1>Order & lisensi</h1><p>Order produk jadi menggunakan harga resmi dari database, bukan nominal dari form.</p></div>
      </section>
      <section className="ops-split">
        <article className="data-panel">
          <div className="data-panel-head"><div><span className="soft-label">ORDER</span><h2>Transaksi produk</h2></div></div>
          <div className="record-list">
            {(orders ?? []).map((order) => (
              <div className="record-card" key={order.id}>
                <div className="record-main"><strong>{order.order_number}</strong><span>{order.customer_name} · {order.products?.name}</span><p>{order.customer_whatsapp || order.customer_email || "Kontak belum lengkap"}</p></div>
                <div className="record-meta"><strong>{rupiah(order.amount)}</strong><span className="badge">{labelStatus(order.payment_status)}</span><small>{tanggal(order.created_at)}</small></div>
                <form action={updateOrder} className="inline-form wide">
                  <input type="hidden" name="id" value={order.id} />
                  <select name="status" defaultValue={order.status}>{orderStatuses.map((s)=><option key={s} value={s}>{labelStatus(s)}</option>)}</select>
                  <select name="payment_status" defaultValue={order.payment_status}>{paymentStatuses.map((s)=><option key={s} value={s}>{labelStatus(s)}</option>)}</select>
                  <button className="mini-button" type="submit">Simpan</button>
                </form>
              </div>
            ))}
            {!orders?.length ? <div className="empty-state">Belum ada order produk jadi.</div> : null}
          </div>
        </article>
        <aside className="form-panel">
          <span className="soft-label">ORDER MANUAL</span><h2>Tambah order</h2>
          <form action={createOrder} className="compact-form">
            <select name="product_id" required defaultValue=""><option value="" disabled>Pilih produk</option>{(products ?? []).map((p)=><option key={p.id} value={p.id}>{p.name} · {rupiah(p.price)}</option>)}</select>
            <input name="customer_name" placeholder="Nama pembeli" required />
            <div className="form-row"><input name="customer_whatsapp" placeholder="WhatsApp" /><input name="customer_email" type="email" placeholder="Email" /></div>
            <select name="source" defaultValue="website"><option value="website">Website</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="whatsapp">WhatsApp</option><option value="referral">Referral</option><option value="lainnya">Lainnya</option></select>
            <button className="primary-button" type="submit">Buat order</button>
          </form>
          <div className="info-box">Lisensi tersimpan sebagai hash, bukan PIN mentah. Flow pengiriman otomatis akan diaktifkan bersama automation engine.</div>
        </aside>
      </section>
    </div>
  );
}
