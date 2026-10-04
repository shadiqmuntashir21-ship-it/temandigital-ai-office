import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { addTask, requestRevision, updateProject } from "./actions";
import { rupiah, tanggal, labelStatus } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };
const statuses = ["baru","berlangsung","menunggu_klien","revisi","menunggu_pelunasan","handover","selesai","dibatalkan"] as const;

export default async function ProjectWorkspace({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireProfile();

  const [{ data: project }, { data: tasks }, { data: revisions }, { data: transactions }] = await Promise.all([
    supabase.from("projects").select("*, clients(name, company, whatsapp, email)").eq("id", id).single(),
    supabase.from("project_tasks").select("*").eq("project_id", id).order("created_at"),
    supabase.from("revisions").select("*").eq("project_id", id).order("revision_no"),
    supabase.from("transactions").select("*").eq("project_id", id).order("occurred_at", { ascending: false }),
  ]);

  if (!project) notFound();

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div><span className="badge">{labelStatus(project.status)}</span><h1>{project.title}</h1><p>{project.clients.name}{project.clients.company ? ` · ${project.clients.company}` : ""}</p></div>
        <div className="workspace-value"><span>Nilai proyek</span><strong>{project.agreed_value ? rupiah(project.agreed_value) : "Belum diisi"}</strong></div>
      </section>

      <section className="workspace-grid">
        <article className="data-panel">
          <div className="data-panel-head"><div><span className="soft-label">CONTROL</span><h2>Status & progres</h2></div></div>
          <form action={updateProject} className="inline-form wide persistent">
            <input type="hidden" name="id" value={project.id} />
            <select name="status" defaultValue={project.status}>{statuses.map((s)=><option key={s} value={s}>{labelStatus(s)}</option>)}</select>
            <input name="progress" type="number" min="0" max="100" defaultValue={project.progress} />
            <button className="mini-button" type="submit">Perbarui</button>
          </form>
          <div className="workspace-stats"><span><strong>{project.progress}%</strong>Progres</span><span><strong>{project.revision_used}/{project.revision_limit}</strong>Revisi</span><span><strong>{tanggal(project.deadline)}</strong>Deadline</span></div>
        </article>

        <article className="data-panel">
          <div className="data-panel-head"><div><span className="soft-label">TASK</span><h2>Tugas</h2></div></div>
          <form action={addTask} className="compact-form">
            <input type="hidden" name="project_id" value={project.id} /><input name="title" placeholder="Task baru" required />
            <textarea name="description" rows={2} placeholder="Deskripsi" />
            <div className="form-row"><select name="priority" defaultValue="2"><option value="1">Prioritas rendah</option><option value="2">Normal</option><option value="3">Tinggi</option><option value="4">Kritis</option></select><input name="due_at" type="datetime-local" /></div>
            <button className="secondary-button" type="submit">Tambah task</button>
          </form>
          <div className="mini-list">{(tasks ?? []).map((task)=><div key={task.id}><strong>{task.title}</strong><span>{task.description || "Tanpa deskripsi"} · {task.status}</span></div>)}</div>
        </article>

        <article className="data-panel">
          <div className="data-panel-head"><div><span className="soft-label">REVISION TRACKER</span><h2>Revisi</h2></div></div>
          <form action={requestRevision} className="compact-form">
            <input type="hidden" name="project_id" value={project.id} /><input name="summary" placeholder="Ringkasan revisi" required /><textarea name="details" rows={2} placeholder="Detail revisi" />
            <button className="secondary-button" type="submit">Ajukan revisi</button>
          </form>
          <div className="mini-list">{(revisions ?? []).map((rev)=><div key={rev.id}><strong>Revisi {rev.revision_no} · {rev.summary}</strong><span>{labelStatus(rev.status)}</span></div>)}</div>
        </article>

        <article className="data-panel">
          <div className="data-panel-head"><div><span className="soft-label">FINANCE</span><h2>Keuangan proyek</h2></div></div>
          <div className="mini-list">{(transactions ?? []).map((tx)=><div key={tx.id}><strong>{rupiah(tx.amount)} · {labelStatus(tx.type)}</strong><span>{labelStatus(tx.status)} · {tanggal(tx.occurred_at)}</span></div>)}</div>
        </article>
      </section>
    </div>
  );
}
