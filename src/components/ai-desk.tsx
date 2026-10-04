"use client";

import { useState } from "react";

export type AITaskHistoryItem = {
  id: string;
  title: string;
  instruction: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  agent: {
    slug: string;
    name: string;
    room: string;
  };
  reply: string | null;
  action: string | null;
  toolMessage: string | null;
  routerReason: string | null;
};

type AIResponse = {
  taskId: string;
  status: string;
  agent: { slug: string; name: string; room: string };
  routerReason: string;
  reply: string;
  action: string;
  toolResult: { status: string; message: string };
};

const agents = [
  ["", "Otomatis · Chief of Staff mengarahkan"],
  ["chief-of-staff", "AI Chief of Staff"],
  ["sales", "AI Sales"],
  ["project-manager", "AI Project Manager"],
  ["creative", "AI Creative"],
  ["finance", "AI Finance"],
  ["reviewer", "AI Reviewer"],
  ["developer", "AI Developer · Owner Only"],
];

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AIDesk({
  isOwner,
  initialTasks,
}: {
  isOwner: boolean;
  initialTasks: AITaskHistoryItem[];
}) {
  const [message, setMessage] = useState("");
  const [agent, setAgent] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTasks[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const instruction = message.trim();
    if (!instruction || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: instruction, agent: agent || undefined }),
      });

      const payload = await response.json() as AIResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "AI Office gagal memproses permintaan.");
      }

      const item: AITaskHistoryItem = {
        id: payload.taskId,
        title: instruction.slice(0, 120),
        instruction,
        status: payload.status,
        createdAt: new Date().toISOString(),
        completedAt: payload.status === "menunggu_approval" ? null : new Date().toISOString(),
        errorMessage: null,
        agent: payload.agent,
        reply: payload.reply,
        action: payload.action,
        toolMessage: payload.toolResult.message,
        routerReason: payload.routerReason,
      };

      setTasks((current) => [item, ...current.filter((task) => task.id !== item.id)].slice(0, 30));
      setSelectedTaskId(item.id);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-workspace">
      <div className="ai-desk">
        <section className="ai-chat-panel">
          <div className="ai-chat-head">
            <div>
              <span className="soft-label">AI ROUTER + PERMISSION LAYER</span>
              <h2>Berikan instruksi</h2>
            </div>
            <span className="status-dot">Guardrail aktif</span>
          </div>

          <form onSubmit={submit} className="ai-compose">
            <select value={agent} onChange={(event) => setAgent(event.target.value)}>
              {agents.filter(([value]) => value !== "developer" || isOwner).map(([value, label]) => (
                <option key={value || "auto"} value={value}>{label}</option>
              ))}
            </select>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={7}
              maxLength={5000}
              placeholder="Contoh: Buatkan rencana konten Instagram Dailyn untuk minggu ini."
            />
            <div className="ai-compose-foot">
              <span>{message.length}/5000</span>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Sedang bekerja…" : "Kirim ke Kantor AI"}
              </button>
            </div>
          </form>

          {error ? <div className="form-alert">{error}</div> : null}
        </section>

        <section className="ai-result-panel">
          {!selectedTask ? (
            <div className="ai-placeholder">
              <span>AI</span>
              <h2>Belum ada pekerjaan.</h2>
              <p>Instruksi pertama Anda akan tersimpan sebagai pekerjaan dan tetap ada setelah pindah fitur.</p>
            </div>
          ) : (
            <>
              <div className="ai-result-agent">
                <div className="agent-avatar">{selectedTask.agent.name.replace("AI ", "").slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{selectedTask.agent.name}</strong>
                  <span>{selectedTask.agent.room}</span>
                </div>
                <span className={`ai-task-status status-${selectedTask.status}`}>
                  {statusLabel(selectedTask.status)}
                </span>
              </div>

              <div className="ai-selected-instruction">
                <span>INSTRUKSI</span>
                <strong>{selectedTask.instruction}</strong>
              </div>

              {selectedTask.reply ? (
                <div className="ai-answer">{selectedTask.reply}</div>
              ) : selectedTask.errorMessage ? (
                <div className="form-alert">{selectedTask.errorMessage}</div>
              ) : (
                <div className="ai-working-state">Pekerjaan sedang diproses.</div>
              )}

              {selectedTask.action ? (
                <div className="ai-action-result">
                  <span>ACTION · {selectedTask.action.replaceAll("_", " ")}</span>
                  <strong>{selectedTask.toolMessage || "Tidak ada perubahan data."}</strong>
                  {selectedTask.routerReason ? <small>Router: {selectedTask.routerReason}</small> : null}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      <section className="ai-history-panel">
        <div className="data-panel-head">
          <div>
            <span className="soft-label">PERSISTENT WORK HISTORY</span>
            <h2>Riwayat pekerjaan AI</h2>
          </div>
          <span>{tasks.length} pekerjaan terbaru</span>
        </div>

        <div className="ai-history-list">
          {tasks.map((task) => (
            <button
              type="button"
              key={task.id}
              className={`ai-history-row ${selectedTask?.id === task.id ? "active" : ""}`}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div className="ai-history-avatar">{task.agent.name.replace("AI ", "").slice(0, 2).toUpperCase()}</div>
              <div className="ai-history-copy">
                <strong>{task.title}</strong>
                <span>{task.agent.name} · {timeLabel(task.createdAt)}</span>
              </div>
              <span className={`ai-task-status status-${task.status}`}>{statusLabel(task.status)}</span>
            </button>
          ))}
          {!tasks.length ? <div className="empty-state">Belum ada pekerjaan AI tersimpan.</div> : null}
        </div>
      </section>
    </div>
  );
}
