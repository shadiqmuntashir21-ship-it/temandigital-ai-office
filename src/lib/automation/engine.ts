import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { createNotification } from "@/lib/automation/notifications";
import { generateDailyBrief } from "@/lib/automation/daily-brief";
import { daysUntil, hoursAgo, makassarDateKey } from "@/lib/automation/time";

type DBClient = SupabaseClient<Database>;
type RuleRow = Database["public"]["Tables"]["automation_rules"]["Row"];

function numberConfig(config: Json, key: string, fallback: number) {
  if (!config || typeof config !== "object" || Array.isArray(config)) return fallback;
  const value = (config as Record<string, Json | undefined>)[key];
  return typeof value === "number" ? value : fallback;
}

async function activeProfiles(supabase: DBClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function ensureApprovalForRule(supabase: DBClient, rule: RuleRow) {
  const title = `Automation approval · ${rule.name}`;
  const { data: existing } = await supabase
    .from("approvals")
    .select("id")
    .eq("title", title)
    .eq("status", "menunggu")
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase.from("approvals").insert({
    category: "automation",
    risk: "high",
    title,
    summary: `Rule ${rule.name} memerlukan persetujuan owner sebelum dapat berjalan.`,
    payload: { automation_rule_id: rule.id, slug: rule.slug },
  }).select("id").single();

  if (error) throw new Error(error.message);
  return data.id;
}

async function runLeadFollowUp(supabase: DBClient, rule: RuleRow) {
  const staleHours = numberConfig(rule.config, "stale_hours", 48);
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, assigned_to, status, updated_at")
    .in("status", ["lead_baru","konsultasi","penawaran","menunggu_dp"])
    .lt("updated_at", hoursAgo(staleHours))
    .order("updated_at");
  if (error) throw new Error(error.message);

  const profiles = await activeProfiles(supabase);
  const today = makassarDateKey();
  let notifications = 0;

  for (const lead of leads ?? []) {
    const recipients = lead.assigned_to
      ? profiles.filter((profile) => profile.id === lead.assigned_to)
      : profiles;

    for (const recipient of recipients) {
      if (await createNotification(supabase, {
        profileId: recipient.id,
        title: "Lead perlu follow-up",
        body: `${lead.name} belum berubah selama ≥ ${staleHours} jam.`,
        level: "warning",
        link: "/sales",
        key: `lead-followup:${lead.id}:${today}:${recipient.id}`,
        ruleId: rule.id,
      })) notifications += 1;
    }
  }

  return { matched: leads?.length ?? 0, notifications };
}

async function runDeadlineWatch(supabase: DBClient, rule: RuleRow) {
  const warningHours = numberConfig(rule.config, "warning_hours", 72);
  const warningDays = Math.max(1, Math.ceil(warningHours / 24));
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, deadline, owner_id, status")
    .not("status", "in", '("selesai","dibatalkan")')
    .not("deadline", "is", null);
  if (error) throw new Error(error.message);

  const profiles = await activeProfiles(supabase);
  const today = makassarDateKey();
  let matched = 0;
  let notifications = 0;

  for (const project of projects ?? []) {
    if (!project.deadline) continue;
    const days = daysUntil(project.deadline, today);
    if (days > warningDays) continue;
    matched += 1;

    const recipients = project.owner_id
      ? profiles.filter((profile) => profile.id === project.owner_id)
      : profiles;
    const overdue = days < 0;
    const body = overdue
      ? `${project.title} melewati deadline ${Math.abs(days)} hari.`
      : days === 0
        ? `${project.title} jatuh tempo hari ini.`
        : `${project.title} jatuh tempo dalam ${days} hari.`;

    for (const recipient of recipients) {
      if (await createNotification(supabase, {
        profileId: recipient.id,
        title: overdue ? "Proyek terlambat" : "Deadline proyek mendekat",
        body,
        level: overdue || days <= 1 ? "critical" : "warning",
        link: `/projects/${project.id}`,
        key: `deadline:${project.id}:${today}:${recipient.id}`,
        ruleId: rule.id,
      })) notifications += 1;
    }
  }

  return { matched, notifications };
}

async function runFinanceWatch(supabase: DBClient, rule: RuleRow) {
  const staleHours = numberConfig(rule.config, "stale_hours", 12);
  const { data: rows, error } = await supabase
    .from("transactions")
    .select("id, amount, description, occurred_at")
    .eq("status", "pending")
    .lt("occurred_at", hoursAgo(staleHours));
  if (error) throw new Error(error.message);

  const owners = (await activeProfiles(supabase)).filter((profile) => profile.role === "owner");
  const today = makassarDateKey();
  let notifications = 0;

  for (const tx of rows ?? []) {
    for (const owner of owners) {
      if (await createNotification(supabase, {
        profileId: owner.id,
        title: "Transaksi belum diverifikasi",
        body: `Ada transaksi pending Rp${Number(tx.amount).toLocaleString("id-ID")} lebih dari ${staleHours} jam.`,
        level: "warning",
        link: "/finance",
        key: `finance-pending:${tx.id}:${today}:${owner.id}`,
        ruleId: rule.id,
      })) notifications += 1;
    }
  }

  return { matched: rows?.length ?? 0, notifications };
}

async function runApprovalWatch(supabase: DBClient, rule: RuleRow) {
  const staleHours = numberConfig(rule.config, "stale_hours", 6);
  const { data: approvals, error } = await supabase
    .from("approvals")
    .select("id, title, risk, created_at")
    .eq("status", "menunggu")
    .lt("created_at", hoursAgo(staleHours));
  if (error) throw new Error(error.message);

  const owners = (await activeProfiles(supabase)).filter((profile) => profile.role === "owner");
  const today = makassarDateKey();
  let notifications = 0;

  for (const approval of approvals ?? []) {
    for (const owner of owners) {
      if (await createNotification(supabase, {
        profileId: owner.id,
        title: "Approval menunggu keputusan",
        body: approval.title,
        level: approval.risk === "critical" || approval.risk === "high" ? "critical" : "warning",
        link: "/approval",
        key: `approval-watch:${approval.id}:${today}:${owner.id}`,
        ruleId: rule.id,
      })) notifications += 1;
    }
  }

  return { matched: approvals?.length ?? 0, notifications };
}

async function runReviewQueueWatch(supabase: DBClient, rule: RuleRow) {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, status")
    .in("status", ["revisi","handover"]);
  if (error) throw new Error(error.message);

  if (!projects?.length) return { matched: 0, notifications: 0 };

  const profiles = await activeProfiles(supabase);
  const today = makassarDateKey();
  let notifications = 0;

  for (const profile of profiles) {
    if (await createNotification(supabase, {
      profileId: profile.id,
      title: "Antrean Review tersedia",
      body: `${projects.length} proyek berada pada tahap revisi/handover dan perlu quality control.`,
      level: "info",
      link: "/review",
      key: `review-queue:${today}:${profile.id}`,
      ruleId: rule.id,
    })) notifications += 1;
  }

  return { matched: projects.length, notifications };
}

async function executeRule(supabase: DBClient, rule: RuleRow) {
  switch (rule.slug) {
    case "daily-brief":
      return generateDailyBrief(supabase, rule.id);
    case "lead-follow-up":
      return runLeadFollowUp(supabase, rule);
    case "project-deadline-watch":
      return runDeadlineWatch(supabase, rule);
    case "finance-pending-watch":
      return runFinanceWatch(supabase, rule);
    case "approval-watch":
      return runApprovalWatch(supabase, rule);
    case "review-queue-watch":
      return runReviewQueueWatch(supabase, rule);
    default:
      return { skipped: true, reason: "Rule belum memiliki executor." };
  }
}

export async function runAutomationRule(
  supabase: DBClient,
  slug: string,
  triggerSource: "manual" | "scheduler" = "manual",
) {
  const { data: rule, error: ruleError } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("slug", slug)
    .single();

  if (ruleError || !rule) throw new Error("Automation rule tidak ditemukan.");

  const { data: run, error: runError } = await supabase.from("automation_runs").insert({
    rule_id: rule.id,
    status: "berjalan",
    trigger_source: triggerSource,
  }).select("id").single();

  if (runError) throw new Error(runError.message);

  if (rule.status !== "active") {
    await supabase.from("automation_runs").update({
      status: "dilewati",
      result: { reason: "Rule sedang paused." },
      completed_at: new Date().toISOString(),
    }).eq("id", run.id);
    return { slug, status: "dilewati", reason: "Rule sedang paused." };
  }

  if (rule.requires_approval) {
    const approvalId = await ensureApprovalForRule(supabase, rule);
    await supabase.from("automation_runs").update({
      status: "dilewati",
      result: { reason: "Menunggu approval owner.", approval_id: approvalId },
      completed_at: new Date().toISOString(),
    }).eq("id", run.id);
    return { slug, status: "dilewati", approvalId };
  }

  try {
    const result = await executeRule(supabase, rule);
    await supabase.from("automation_runs").update({
      status: "selesai",
      result: result as unknown as Json,
      completed_at: new Date().toISOString(),
    }).eq("id", run.id);
    return { slug, status: "selesai", result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Automation gagal.";
    await supabase.from("automation_runs").update({
      status: "gagal",
      error_message: message,
      completed_at: new Date().toISOString(),
    }).eq("id", run.id);
    throw error;
  }
}

export async function runAutomationCadence(
  supabase: DBClient,
  cadence: "hourly" | "daily",
) {
  const { data: rules, error } = await supabase
    .from("automation_rules")
    .select("slug")
    .eq("status", "active")
    .eq("trigger_type", cadence)
    .order("slug");

  if (error) throw new Error(error.message);

  const results = [];
  for (const rule of rules ?? []) {
    try {
      results.push(await runAutomationRule(supabase, rule.slug, "scheduler"));
    } catch (error) {
      results.push({
        slug: rule.slug,
        status: "gagal",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  return results;
}
