create type public.automation_trigger as enum ('manual', 'daily', 'hourly', 'event');
create type public.automation_status as enum ('active', 'paused');
create type public.automation_run_status as enum ('berjalan', 'selesai', 'gagal', 'dilewati');

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  trigger_type public.automation_trigger not null default 'manual',
  schedule_cron text,
  status public.automation_status not null default 'active',
  requires_approval boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.automation_rules(id) on delete cascade,
  status public.automation_run_status not null default 'berjalan',
  trigger_source text not null default 'manual',
  result jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.daily_briefs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  brief_date date not null default current_date,
  title text not null,
  summary text not null,
  priorities jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (profile_id, brief_date)
);

create index idx_automation_rules_status_trigger on public.automation_rules(status, trigger_type);
create index idx_automation_runs_rule_started on public.automation_runs(rule_id, started_at desc);
create index idx_daily_briefs_profile_date on public.daily_briefs(profile_id, brief_date desc);

create trigger set_automation_rules_updated_at
before update on public.automation_rules
for each row execute function private.set_updated_at();

alter table public.automation_rules enable row level security;
alter table public.automation_runs enable row level security;
alter table public.daily_briefs enable row level security;

grant select, insert, update, delete on public.automation_rules to authenticated;
grant select, insert, update, delete on public.automation_runs to authenticated;
grant select, insert, update, delete on public.daily_briefs to authenticated;

create policy automation_rules_select_internal on public.automation_rules
for select to authenticated using (private.is_internal_user());
create policy automation_rules_insert_owner on public.automation_rules
for insert to authenticated with check (private.is_owner());
create policy automation_rules_update_owner on public.automation_rules
for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy automation_rules_delete_owner on public.automation_rules
for delete to authenticated using (private.is_owner());

create policy automation_runs_select_internal on public.automation_runs
for select to authenticated using (private.is_internal_user());
create policy automation_runs_insert_internal on public.automation_runs
for insert to authenticated with check (private.is_internal_user());
create policy automation_runs_update_internal on public.automation_runs
for update to authenticated using (private.is_internal_user()) with check (private.is_internal_user());
create policy automation_runs_delete_owner on public.automation_runs
for delete to authenticated using (private.is_owner());

create policy daily_briefs_select_self on public.daily_briefs
for select to authenticated using (profile_id = (select auth.uid()) or private.is_owner());
create policy daily_briefs_insert_self on public.daily_briefs
for insert to authenticated with check (profile_id = (select auth.uid()) or private.is_owner());
create policy daily_briefs_update_self on public.daily_briefs
for update to authenticated using (profile_id = (select auth.uid()) or private.is_owner())
with check (profile_id = (select auth.uid()) or private.is_owner());
create policy daily_briefs_delete_owner on public.daily_briefs
for delete to authenticated using (private.is_owner());

insert into public.automation_rules
  (slug, name, description, trigger_type, schedule_cron, requires_approval, config)
values
  (
    'daily-brief',
    'Daily Brief',
    'Merangkum kondisi operasional Teman Digital untuk pengguna internal.',
    'daily',
    '0 0 * * *',
    false,
    '{"timezone":"Asia/Makassar","local_time":"08:00"}'::jsonb
  ),
  (
    'lead-follow-up',
    'Lead Follow-up',
    'Mengingatkan lead aktif yang tidak berubah selama 2 hari.',
    'daily',
    '15 0 * * *',
    false,
    '{"stale_hours":48}'::jsonb
  ),
  (
    'project-deadline-watch',
    'Project Deadline Watch',
    'Mendeteksi proyek aktif yang mendekati atau melewati deadline.',
    'hourly',
    '0 * * * *',
    false,
    '{"warning_hours":72,"critical_hours":24}'::jsonb
  ),
  (
    'finance-pending-watch',
    'Finance Pending Watch',
    'Mengingatkan transaksi pending yang belum diverifikasi.',
    'hourly',
    '20 * * * *',
    false,
    '{"stale_hours":12}'::jsonb
  ),
  (
    'approval-watch',
    'Approval Watch',
    'Mengingatkan approval yang masih menunggu keputusan owner.',
    'hourly',
    '40 * * * *',
    false,
    '{"stale_hours":6}'::jsonb
  ),
  (
    'review-queue-watch',
    'Review Queue Watch',
    'Mengingatkan proyek berstatus revisi/handover agar masuk quality control.',
    'daily',
    '30 0 * * *',
    false,
    '{"statuses":["revisi","handover"]}'::jsonb
  );
