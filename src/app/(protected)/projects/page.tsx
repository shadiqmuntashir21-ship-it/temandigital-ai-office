import Link from "next/link";
import { requireProfile } from "@/lib/auth/require-profile";
import { createProject } from "./actions";
import { rupiah, tanggal, labelStatus } from "@/lib/format";

export default async function ProjectsPage() {
  const { supabase } = await requireProfile();
  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("*, clients(name, company)").order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name, company").order("name"),
  ]);

  return (
    <div className="ops-page">
      <section className="page-heading"><div><span className="eyebrow dark">PROJECT ROOM</span><h1>Proyek aktif</h1><p>Setiap proyek memiliki workspace untuk task, timeline, revisi, dan aktivitas.</p></div></section>
      <section className="ops-split">
        <article className="data-panel">
          <div className="project-list">
            {(projects ?? []).map((project) => (
              <Link prefetch={false} href={`/projects/${project.id}`} className="project-card" key={project.id}>
                <div><span className="badge">{labelStatus(project.status)}</span><h2>{project.title}</h2><p>{project.clients?.name}{project.clients?.company ? ` · ${project.clients.company}` : ""}</p></div>
                <div className="progress-wrap"><div className="progress-track"><span style={{width:`${project.progress}%`}} /></div><strong>{project.progress}%</strong></div>
                <div className="project-foot"><span>Deadline {tanggal(project.deadline)}</span><span>Revisi {project.revision_used}/{project.revision_limit}</span><strong>{project.agreed_value ? rupiah(project.agreed_value) : "Nilai belum ada"}</strong></div>
              </Link>
            ))}
            {!projects?.length ? <div className="empty-state">Belum ada proyek.</div> : null}
          </div>
        </article>
        <aside className="form-panel">
          <span className="soft-label">PROYEK BARU</span><h2>Buat workspace</h2>
          <form action={createProject} className="compact-form">
            <select name="client_id" required defaultValue=""><option value="" disabled>Pilih klien</option>{(clients ?? []).map((c)=><option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}</select>
            <input name="title" placeholder="Nama proyek" required />
            <select name="service_type" defaultValue="web_custom"><option value="landing_page">Landing Page</option><option value="dashboard">Dashboard</option><option value="web_custom">Web Custom</option><option value="produk_jadi">Produk Jadi</option><option value="lainnya">Lainnya</option></select>
            <input name="deadline" type="date" /><input name="agreed_value" type="number" min="0" placeholder="Nilai proyek" />
            <textarea name="brief" rows={4} placeholder="Brief awal" />
            <button className="primary-button" type="submit">Buat proyek</button>
          </form>
        </aside>
      </section>
    </div>
  );
}
