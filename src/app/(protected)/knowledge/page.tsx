import { requireProfile } from "@/lib/auth/require-profile";
import { createKnowledge } from "./actions";
import { tanggal } from "@/lib/format";

export default async function KnowledgePage() {
  const { supabase, profile } = await requireProfile();
  const { data: docs } = await supabase.from("knowledge_documents").select("*").eq("is_active", true).order("category").order("updated_at", { ascending: false });

  return (
    <div className="ops-page">
      <section className="page-heading"><div><span className="eyebrow dark">KNOWLEDGE BASE</span><h1>Sumber kebenaran AI</h1><p>AI harus merujuk data brand, pricing, SOP, project, dan technical context yang tersimpan di sini.</p></div></section>
      <section className={profile.role==="owner" ? "ops-split" : ""}>
        <article className="data-panel">
          <div className="knowledge-list">{(docs ?? []).map((doc)=><article className="knowledge-card" key={doc.id}><div><span className="badge">{doc.category}</span><small>v{doc.version} · {tanggal(doc.updated_at)}</small></div><h2>{doc.title}</h2><p>{doc.content || "Dokumen tersimpan sebagai file."}</p></article>)}</div>
        </article>
        {profile.role==="owner" ? <aside className="form-panel"><span className="soft-label">DOKUMEN BARU</span><h2>Tambah knowledge</h2><form action={createKnowledge} className="compact-form"><select name="category" defaultValue="SOP"><option>Brand</option><option>Produk</option><option>Pricing</option><option>Sales</option><option>Finance</option><option>Project</option><option>Technical</option><option>Template</option><option>SOP</option></select><input name="title" placeholder="Judul" required/><textarea name="content" rows={8} placeholder="Isi sumber kebenaran" required/><button className="primary-button" type="submit">Simpan knowledge</button></form></aside> : null}
      </section>
    </div>
  );
}
