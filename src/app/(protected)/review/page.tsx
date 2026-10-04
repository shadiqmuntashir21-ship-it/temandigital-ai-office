import Link from "next/link";
import { requireProfile } from "@/lib/auth/require-profile";
import { tanggal, labelStatus } from "@/lib/format";

export default async function ReviewPage() {
  const { supabase } = await requireProfile();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, deadline, progress, clients(name)")
    .in("status", ["revisi","handover"])
    .order("deadline");

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">REVIEW ROOM</span>
          <h1>Quality control queue</h1>
          <p>Proyek pada tahap revisi dan handover otomatis muncul sebagai antrean review.</p>
        </div>
      </section>
      <section className="module-grid">
        {(projects ?? []).map((p) => (
          <Link prefetch={false} href={`/projects/${p.id}`} className="module-card" key={p.id}>
            <span className="badge">{labelStatus(p.status)}</span>
            <h2>{p.title}</h2>
            <p>{p.clients?.name} · progres {p.progress}% · deadline {tanggal(p.deadline)}</p>
          </Link>
        ))}
        {!projects?.length ? <div className="empty-state">Queue review kosong.</div> : null}
      </section>
    </div>
  );
}
