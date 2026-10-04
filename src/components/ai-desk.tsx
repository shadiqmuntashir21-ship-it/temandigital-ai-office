"use client";

import { useState } from "react";

type AIResponse = {
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

export function AIDesk({ isOwner }: { isOwner: boolean }) {
  const [message, setMessage] = useState("");
  const [agent, setAgent] = useState("");
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, agent: agent || undefined }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "AI Office gagal memproses permintaan.");
      }

      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
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
            placeholder="Contoh: Ada calon klien bernama Rina dari WhatsApp butuh dashboard sekolah budget 500 ribu. Catat sebagai lead."
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
        {!result ? (
          <div className="ai-placeholder">
            <span>AI</span>
            <h2>Belum ada pekerjaan.</h2>
            <p>Instruksi akan diarahkan ke pegawai AI yang tepat dan setiap tindakan melewati permission layer.</p>
          </div>
        ) : (
          <>
            <div className="ai-result-agent">
              <div className="agent-avatar">{result.agent.name.replace("AI ", "").slice(0, 2).toUpperCase()}</div>
              <div><strong>{result.agent.name}</strong><span>{result.agent.room}</span></div>
            </div>
            <div className="ai-answer">{result.reply}</div>
            <div className="ai-action-result">
              <span>ACTION · {result.action.replaceAll("_", " ")}</span>
              <strong>{result.toolResult.message}</strong>
              <small>Router: {result.routerReason}</small>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
