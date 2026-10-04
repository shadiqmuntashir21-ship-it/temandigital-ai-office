import { requireProfile } from "@/lib/auth/require-profile";
import { runRuleNow, toggleRule } from "./actions";
import { labelStatus, tanggal } from "@/lib/format";

export default async function AutomationPage() {
  const { supabase, profile } = await requireProfile();

  const [{ data: rules }, { data: runs }, { data: brief }] = await Promise.all([
    supabase.from("automation_rules").select("*").order("trigger_type").order("name"),
    supabase.from("automation_runs")
      .select("*, automation_rules(name, slug)")
      .order("started_at", { ascending: false })
      .limit(20),
    supabase.from("daily_briefs")
      .select("title, summary, priorities, created_at")
      .eq("profile_id", profile.id)
      .order("brief_date", { ascending: false })
      .limit(1),
  ]);

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">AUTOMATION ENGINE</span>
          <h1>Workflow otomatis</h1>
          <p>
            Reminder dan Daily Brief boleh berjalan otomatis. Tindakan sensitif tetap
            masuk Approval Center dan tidak memiliki jalur bypass.
          </p>
        </div>
      </section>

      {brief?.[0] ? (
        <section className="automation-brief">
          <span className="soft-label">DAILY BRIEF TERBARU</span>
          <h2>{brief[0].title}</h2>
          <p>{brief[0].summary}</p>
          <div className="brief-tags">
            {Array.isArray(brief[0].priorities)
              ? brief[0].priorities.map((item, index) => (
                  <span key={index}>{String(item)}</span>
                ))
              : null}
          </div>
        </section>
      ) : null}

      <section className="automation-grid">
        {(rules ?? []).map((rule) => (
          <article className="automation-card" key={rule.id}>
            <div className="automation-card-top">
              <div>
                <span className="badge">{labelStatus(rule.trigger_type)}</span>
                <h2>{rule.name}</h2>
              </div>
              <span className={`automation-state ${rule.status}`}>{labelStatus(rule.status)}</span>
            </div>
            <p>{rule.description}</p>
            <div className="automation-meta">
              <span>Schedule <strong>{rule.schedule_cron || "manual"}</strong></span>
              <span>Approval <strong>{rule.requires_approval ? "wajib" : "tidak"}</strong></span>
            </div>
            {profile.role === "owner" ? (
              <div className="automation-actions">
                <form action={runRuleNow}>
                  <input type="hidden" name="slug" value={rule.slug} />
                  <button className="secondary-button" type="submit">Jalankan sekarang</button>
                </form>
                <form action={toggleRule}>
                  <input type="hidden" name="id" value={rule.id} />
                  <input type="hidden" name="next" value={rule.status === "active" ? "paused" : "active"} />
                  <button className="ghost-button" type="submit">
                    {rule.status === "active" ? "Jeda" : "Aktifkan"}
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="data-panel section-gap">
        <div className="data-panel-head">
          <div><span className="soft-label">RUN HISTORY</span><h2>Eksekusi terbaru</h2></div>
        </div>
        <div className="automation-runs">
          {(runs ?? []).map((run) => (
            <div className="automation-run" key={run.id}>
              <div>
                <strong>{run.automation_rules?.name || "Automation"}</strong>
                <span>{run.trigger_source} · {tanggal(run.started_at)}</span>
              </div>
              <span className={`run-status ${run.status}`}>{labelStatus(run.status)}</span>
              <small>{run.error_message || (run.completed_at ? "Selesai diproses" : "Sedang diproses")}</small>
            </div>
          ))}
          {!runs?.length ? <div className="empty-state">Belum ada automation run.</div> : null}
        </div>
      </section>
    </div>
  );
}
