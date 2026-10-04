import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { getAIProvider } from "@/lib/ai/provider";
import { makassarDateKey } from "@/lib/automation/time";
import { createNotification } from "@/lib/automation/notifications";

type BriefMetrics = {
  orders: number;
  leads: number;
  projects: number;
  approvals: number;
  pendingTransactions: number;
  reviewQueue: number;
  overdueProjects: number;
};

function fallbackSummary(metrics: BriefMetrics) {
  return [
    `Operasional hari ini: ${metrics.orders} order aktif, ${metrics.leads} lead custom, dan ${metrics.projects} proyek aktif.`,
    metrics.approvals > 0 ? `${metrics.approvals} approval masih menunggu keputusan.` : "Tidak ada approval tertunda.",
    metrics.overdueProjects > 0 ? `${metrics.overdueProjects} proyek melewati deadline.` : "Tidak ada proyek terlambat.",
    metrics.pendingTransactions > 0 ? `${metrics.pendingTransactions} transaksi masih pending verifikasi.` : "Tidak ada transaksi pending.",
  ].join(" ");
}

function prioritiesFrom(metrics: BriefMetrics) {
  const priorities: string[] = [];
  if (metrics.approvals > 0) priorities.push(`Tinjau ${metrics.approvals} approval yang menunggu.`);
  if (metrics.overdueProjects > 0) priorities.push(`Tangani ${metrics.overdueProjects} proyek yang melewati deadline.`);
  if (metrics.pendingTransactions > 0) priorities.push(`Verifikasi ${metrics.pendingTransactions} transaksi pending.`);
  if (metrics.reviewQueue > 0) priorities.push(`Selesaikan ${metrics.reviewQueue} antrean review.`);
  if (metrics.leads > 0) priorities.push("Pastikan lead aktif memiliki tindak lanjut.");
  if (!priorities.length) priorities.push("Tidak ada isu kritis. Fokus pada pekerjaan prioritas yang berjalan.");
  return priorities.slice(0, 5);
}

export async function generateDailyBrief(
  supabase: SupabaseClient<Database>,
  ruleId: string,
) {
  const today = makassarDateKey();

  const [
    profilesRes,
    ordersRes,
    leadsRes,
    projectsRes,
    approvalsRes,
    pendingRes,
    reviewRes,
    overdueRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true }).neq("status", "dibatalkan"),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["lead_baru","konsultasi","penawaran","menunggu_dp"]),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", '("selesai","dibatalkan")'),
    supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
    supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["revisi","handover"]),
    supabase.from("projects").select("*", { count: "exact", head: true })
      .not("status", "in", '("selesai","dibatalkan")')
      .lt("deadline", today),
  ]);

  const metrics: BriefMetrics = {
    orders: ordersRes.count ?? 0,
    leads: leadsRes.count ?? 0,
    projects: projectsRes.count ?? 0,
    approvals: approvalsRes.count ?? 0,
    pendingTransactions: pendingRes.count ?? 0,
    reviewQueue: reviewRes.count ?? 0,
    overdueProjects: overdueRes.count ?? 0,
  };

  const priorities = prioritiesFrom(metrics);
  let summary = fallbackSummary(metrics);

  try {
    const provider = getAIProvider();
    summary = await provider.generateText({
      system: [
        "Anda adalah AI Chief of Staff Teman Digital.",
        "Buat daily brief operasional maksimal 110 kata.",
        "Gunakan hanya angka/fakta yang diberikan.",
        "Bahasa Indonesia natural, profesional, ringkas.",
        "Jangan membuat fakta baru, harga baru, atau status pembayaran yang tidak diberikan.",
      ].join("\n"),
      prompt: JSON.stringify({ date: today, metrics, priorities }),
    });
  } catch {
    // Daily Brief tetap berfungsi tanpa provider AI menggunakan ringkasan deterministik.
  }

  let created = 0;
  for (const profile of profilesRes.data ?? []) {
    const { error } = await supabase.from("daily_briefs").upsert({
      profile_id: profile.id,
      brief_date: today,
      title: `Daily Brief · ${today}`,
      summary,
      priorities: priorities as Json,
      metrics: metrics as unknown as Json,
    }, { onConflict: "profile_id,brief_date" });

    if (error) throw new Error(error.message);

    const inserted = await createNotification(supabase, {
      profileId: profile.id,
      title: "Daily Brief siap",
      body: priorities[0] ?? summary,
      level: metrics.approvals > 0 || metrics.overdueProjects > 0 ? "warning" : "info",
      link: "/kantor",
      key: `daily-brief:${today}:${profile.id}`,
      ruleId,
    });
    if (inserted) created += 1;
  }

  return { profiles: profilesRes.data?.length ?? 0, notifications: created, metrics, summary, priorities };
}
