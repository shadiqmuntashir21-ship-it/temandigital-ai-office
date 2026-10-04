import Link from "next/link";
import { requireProfile } from "@/lib/auth/require-profile";
import type { Json } from "@/types/database";

function asRecord(value: Json | null): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function CreativePage() {
  const { supabase } = await requireProfile();

  const { data: creative } = await supabase
    .from("ai_agents")
    .select("id, name, status")
    .eq("slug", "creative")
    .single();

  const { data: tasks } = creative
    ? await supabase
        .from("ai_tasks")
        .select("id, title, instruction, status, created_at, completed_at, output, error_message")
        .eq("agent_id", creative.id)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const rows = tasks ?? [];
  const completed = rows.filter((task) => task.status === "selesai").length;
  const running = rows.filter((task) => task.status === "berjalan").length;
  const needsAttention = rows.filter((task) => task.status === "gagal" || task.status === "menunggu_approval").length;

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">CREATIVE ROOM</span>
          <h1>Studio kreatif AI</h1>
          <p>
            Brief dan hasil AI Creative tersimpan permanen. Pindah menu atau refresh tidak
            menghapus pekerjaan yang sudah diberikan.
          </p>
        </div>
        <Link href="/ai" prefetch={false} className="primary-button">Beri brief baru</Link>
      </section>

      <section className="creative-stats">
        <article><span>Status AI Creative</span><strong>{statusLabel(creative?.status ?? "offline")}</strong></article>
        <article><span>Selesai</span><strong>{completed}</strong></article>
        <article><span>Sedang bekerja</span><strong>{running}</strong></article>
        <article><span>Perlu perhatian</span><strong>{needsAttention}</strong></article>
      </section>

      <section className="data-panel section-gap">
        <div className="data-panel-head">
          <div>
            <span className="soft-label">WORK QUEUE</span>
            <h2>Pekerjaan AI Creative</h2>
          </div>
          <span>{rows.length} pekerjaan terbaru</span>
        </div>

        <div className="creative-task-list">
          {rows.map((task) => {
            const output = asRecord(task.output);
            const reply = typeof output.reply === "string" ? output.reply : null;

            return (
              <details className="creative-task-card" key={task.id}>
                <summary>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{dateLabel(task.created_at)}</span>
                  </div>
                  <span className={`ai-task-status status-${task.status}`}>{statusLabel(task.status)}</span>
                </summary>
                <div className="creative-task-body">
                  <div>
                    <span className="soft-label">BRIEF</span>
                    <p>{task.instruction}</p>
                  </div>
                  {reply ? (
                    <div>
                      <span className="soft-label">HASIL AI CREATIVE</span>
                      <div className="creative-task-result">{reply}</div>
                    </div>
                  ) : task.error_message ? (
                    <div className="form-alert">{task.error_message}</div>
                  ) : (
                    <div className="ai-working-state">Pekerjaan sedang diproses.</div>
                  )}
                </div>
              </details>
            );
          })}
          {!rows.length ? <div className="empty-state">Belum ada brief untuk AI Creative.</div> : null}
        </div>
      </section>
    </div>
  );
}
