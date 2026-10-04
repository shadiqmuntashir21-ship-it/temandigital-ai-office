create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create type public.app_role as enum ('owner', 'staff');
create type public.lead_source as enum ('instagram', 'tiktok', 'whatsapp', 'website', 'referral', 'lainnya');
create type public.lead_status as enum ('lead_baru', 'konsultasi', 'penawaran', 'menunggu_dp', 'deal', 'tidak_jadi');
create type public.order_status as enum ('menunggu_pembayaran', 'dibayar', 'diproses', 'akses_dikirim', 'aktif', 'selesai', 'dibatalkan');
create type public.project_status as enum ('baru', 'berlangsung', 'menunggu_klien', 'revisi', 'menunggu_pelunasan', 'handover', 'selesai', 'dibatalkan');
create type public.service_type as enum ('landing_page', 'dashboard', 'web_custom', 'produk_jadi', 'lainnya');
create type public.payment_status as enum ('belum_bayar', 'dp', 'lunas', 'gagal', 'refund');
create type public.approval_risk as enum ('low', 'medium', 'high', 'critical');
create type public.approval_status as enum ('menunggu', 'disetujui', 'ditolak', 'minta_revisi');
create type public.agent_status as enum ('tersedia', 'sedang_bekerja', 'menunggu_informasi', 'review', 'perlu_perhatian', 'offline');
create type public.ai_task_status as enum ('antri', 'berjalan', 'menunggu_input', 'menunggu_approval', 'selesai', 'gagal', 'dibatalkan');
create type public.transaction_type as enum ('pemasukan', 'pengeluaran', 'dp', 'pelunasan', 'refund');
create type public.transaction_status as enum ('pending', 'terverifikasi', 'gagal', 'dibatalkan');
create type public.invoice_status as enum ('draft', 'terkirim', 'sebagian', 'lunas', 'jatuh_tempo', 'dibatalkan');
create type public.revision_status as enum ('diajukan', 'diterima', 'dikerjakan', 'selesai', 'ditolak', 'scope_baru');
create type public.notification_level as enum ('info', 'success', 'warning', 'critical');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'staff',
  department text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text,
  email text,
  company text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price integer not null check (price >= 0),
  description text,
  license_enabled boolean not null default true,
  is_active boolean not null default true,
  warranty_text text not null default 'Garansi selamanya untuk bug/error pada fitur dalam scope awal.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  department text not null,
  system_role text not null,
  owner_only boolean not null default false,
  status public.agent_status not null default 'tersedia',
  capabilities jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '[]'::jsonb,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  whatsapp text,
  email text,
  company text,
  source public.lead_source not null default 'lainnya',
  needs text,
  budget numeric(14,2) check (budget is null or budget >= 0),
  ai_summary text,
  notes text,
  status public.lead_status not null default 'lead_baru',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  customer_name text not null,
  customer_email text,
  customer_whatsapp text,
  source public.lead_source not null default 'website',
  amount integer not null check (amount >= 0),
  status public.order_status not null default 'menunggu_pembayaran',
  payment_status public.payment_status not null default 'belum_bayar',
  payment_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  license_hash text not null unique,
  masked_code text,
  is_active boolean not null default true,
  activated_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  service_type public.service_type not null,
  service_label text,
  status public.project_status not null default 'baru',
  brief text,
  start_date date,
  deadline date,
  progress smallint not null default 0 check (progress between 0 and 100),
  revision_limit smallint not null default 5 check (revision_limit >= 0),
  revision_used smallint not null default 0 check (revision_used >= 0 and revision_used <= revision_limit),
  payment_status public.payment_status not null default 'belum_bayar',
  agreed_value numeric(14,2) check (agreed_value is null or agreed_value >= 0),
  dp_amount numeric(14,2) check (dp_amount is null or dp_amount >= 0),
  final_amount numeric(14,2) check (final_amount is null or final_amount >= 0),
  owner_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'baru',
  priority smallint not null default 2 check (priority between 1 and 4),
  due_at timestamptz,
  completed_at timestamptz,
  assignee_profile_id uuid references public.profiles(id) on delete set null,
  assignee_agent_id uuid references public.ai_agents(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  requester_profile_id uuid references public.profiles(id) on delete set null,
  requester_agent_id uuid references public.ai_agents(id) on delete set null,
  category text not null,
  risk public.approval_risk not null default 'medium',
  title text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  status public.approval_status not null default 'menunggu',
  decided_by uuid references public.profiles(id) on delete set null,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  revision_no smallint not null check (revision_no > 0),
  summary text not null,
  details text,
  status public.revision_status not null default 'diajukan',
  is_scope_change boolean not null default false,
  approval_id uuid references public.approvals(id) on delete set null,
  requested_by uuid references public.profiles(id) on delete set null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (project_id, revision_no)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  type public.transaction_type not null,
  status public.transaction_status not null default 'pending',
  amount numeric(14,2) not null check (amount >= 0),
  description text,
  reference text,
  occurred_at timestamptz not null default now(),
  verified_by uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  status public.invoice_status not null default 'draft',
  issued_at date not null default current_date,
  due_date date,
  paid_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  agent_id uuid not null references public.ai_agents(id) on delete restrict,
  parent_task_id uuid references public.ai_tasks(id) on delete set null,
  title text not null,
  instruction text not null,
  status public.ai_task_status not null default 'antri',
  risk public.approval_risk not null default 'low',
  owner_only boolean not null default false,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_handoffs (
  id uuid primary key default gen_random_uuid(),
  ai_task_id uuid not null references public.ai_tasks(id) on delete cascade,
  from_agent_id uuid not null references public.ai_agents(id) on delete restrict,
  to_agent_id uuid not null references public.ai_agents(id) on delete restrict,
  reason text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text,
  storage_path text,
  version integer not null default 1 check (version > 0),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (content is not null or storage_path is not null)
);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  actor_type text not null check (actor_type in ('human', 'ai', 'system')),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_agent_id uuid references public.ai_agents(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  level public.notification_level not null default 'info',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_clients_email on public.clients(email);
create index idx_leads_status_created on public.leads(status, created_at desc);
create index idx_leads_assigned_to on public.leads(assigned_to);
create index idx_orders_status_created on public.orders(status, created_at desc);
create index idx_orders_client on public.orders(client_id);
create index idx_licenses_order on public.licenses(order_id);
create index idx_projects_status_deadline on public.projects(status, deadline);
create index idx_projects_client on public.projects(client_id);
create index idx_project_tasks_project_status on public.project_tasks(project_id, status);
create index idx_revisions_project on public.revisions(project_id, revision_no);
create index idx_transactions_project_date on public.transactions(project_id, occurred_at desc);
create index idx_transactions_order on public.transactions(order_id);
create index idx_invoices_status_due on public.invoices(status, due_date);
create index idx_ai_tasks_agent_status on public.ai_tasks(agent_id, status);
create index idx_ai_tasks_project on public.ai_tasks(project_id);
create index idx_approvals_status_risk on public.approvals(status, risk, created_at desc);
create index idx_knowledge_category_active on public.knowledge_documents(category, is_active);
create index idx_activity_logs_project_created on public.activity_logs(project_id, created_at desc);
create index idx_activity_logs_actor_created on public.activity_logs(actor_type, created_at desc);
create index idx_notifications_profile_unread on public.notifications(profile_id, read_at, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','clients','products','ai_agents','leads','orders','projects',
    'project_tasks','approvals','invoices','ai_tasks','knowledge_documents'
  ]
  loop
    execute format('create trigger %I before update on public.%I for each row execute function private.set_updated_at()', 'set_' || t || '_updated_at', t);
  end loop;
end $$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true
  );
$$;

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true and p.role = 'owner'
  );
$$;

create or replace function private.can_access_agent(target_agent uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.ai_agents a
    where a.id = target_agent
      and (a.owner_only = false or private.is_owner())
  );
$$;

revoke all on function private.is_internal_user() from public, anon;
revoke all on function private.is_owner() from public, anon;
revoke all on function private.can_access_agent(uuid) from public, anon;
grant execute on function private.is_internal_user() to authenticated;
grant execute on function private.is_owner() to authenticated;
grant execute on function private.can_access_agent(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.ai_agents enable row level security;
alter table public.leads enable row level security;
alter table public.orders enable row level security;
alter table public.licenses enable row level security;
alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.approvals enable row level security;
alter table public.revisions enable row level security;
alter table public.transactions enable row level security;
alter table public.invoices enable row level security;
alter table public.ai_tasks enable row level security;
alter table public.ai_handoffs enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy profiles_select_internal on public.profiles for select to authenticated using (private.is_internal_user());
create policy profiles_update_owner on public.profiles for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy profiles_insert_owner on public.profiles for insert to authenticated with check (private.is_owner());
create policy profiles_delete_owner on public.profiles for delete to authenticated using (private.is_owner());

do $$
declare t text;
begin
  foreach t in array array[
    'clients','products','leads','orders','licenses','projects','project_tasks',
    'revisions','transactions','invoices'
  ]
  loop
    execute format('create policy %I on public.%I for select to authenticated using (private.is_internal_user())', t || '_select_internal', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.is_internal_user())', t || '_insert_internal', t);
    execute format('create policy %I on public.%I for update to authenticated using (private.is_internal_user()) with check (private.is_internal_user())', t || '_update_internal', t);
    execute format('create policy %I on public.%I for delete to authenticated using (private.is_owner())', t || '_delete_owner', t);
  end loop;
end $$;

create policy agents_select_allowed on public.ai_agents
for select to authenticated
using (private.is_internal_user() and (owner_only = false or private.is_owner()));
create policy agents_insert_owner on public.ai_agents for insert to authenticated with check (private.is_owner());
create policy agents_update_owner on public.ai_agents for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy agents_delete_owner on public.ai_agents for delete to authenticated using (private.is_owner());

create policy approvals_select_internal on public.approvals for select to authenticated using (private.is_internal_user());
create policy approvals_insert_internal on public.approvals for insert to authenticated with check (private.is_internal_user());
create policy approvals_update_owner on public.approvals for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy approvals_delete_owner on public.approvals for delete to authenticated using (private.is_owner());

create policy ai_tasks_select_allowed on public.ai_tasks
for select to authenticated
using (private.is_internal_user() and (owner_only = false or private.is_owner()) and private.can_access_agent(agent_id));
create policy ai_tasks_insert_allowed on public.ai_tasks
for insert to authenticated
with check (private.is_internal_user() and (owner_only = false or private.is_owner()) and private.can_access_agent(agent_id));
create policy ai_tasks_update_allowed on public.ai_tasks
for update to authenticated
using (private.is_internal_user() and (owner_only = false or private.is_owner()) and private.can_access_agent(agent_id))
with check (private.is_internal_user() and (owner_only = false or private.is_owner()) and private.can_access_agent(agent_id));
create policy ai_tasks_delete_owner on public.ai_tasks for delete to authenticated using (private.is_owner());

create policy handoffs_select_internal on public.ai_handoffs
for select to authenticated
using (private.is_internal_user() and private.can_access_agent(from_agent_id) and private.can_access_agent(to_agent_id));
create policy handoffs_insert_internal on public.ai_handoffs
for insert to authenticated
with check (private.is_internal_user() and private.can_access_agent(from_agent_id) and private.can_access_agent(to_agent_id));
create policy handoffs_delete_owner on public.ai_handoffs for delete to authenticated using (private.is_owner());

create policy knowledge_select_internal on public.knowledge_documents for select to authenticated using (private.is_internal_user());
create policy knowledge_insert_owner on public.knowledge_documents for insert to authenticated with check (private.is_owner());
create policy knowledge_update_owner on public.knowledge_documents for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy knowledge_delete_owner on public.knowledge_documents for delete to authenticated using (private.is_owner());

create policy logs_select_internal on public.activity_logs for select to authenticated using (private.is_internal_user());
create policy logs_insert_internal on public.activity_logs for insert to authenticated with check (private.is_internal_user());

create policy notifications_select_self on public.notifications
for select to authenticated
using (profile_id = auth.uid() or private.is_owner());
create policy notifications_insert_internal on public.notifications
for insert to authenticated
with check (private.is_internal_user());
create policy notifications_update_self on public.notifications
for update to authenticated
using (profile_id = auth.uid() or private.is_owner())
with check (profile_id = auth.uid() or private.is_owner());
create policy notifications_delete_owner on public.notifications for delete to authenticated using (private.is_owner());

insert into public.products (name, slug, price, description, license_enabled)
values
  ('Dailyn', 'dailyn', 39000, 'Produk digital Teman Digital.', true),
  ('Growva', 'growva', 39000, 'Produk digital Teman Digital.', true),
  ('Menuju Kita', 'menuju-kita', 49000, 'Produk digital Teman Digital.', true),
  ('KelasKita', 'kelaskita', 99000, 'Produk digital Teman Digital.', true);

insert into public.ai_agents (slug, name, department, system_role, owner_only, capabilities, guardrails)
values
  ('chief-of-staff', 'AI Chief of Staff', 'Command Center', 'Orkestrator utama, pemecah pekerjaan, handoff, monitoring deadline, daily brief.', false,
   '["task_routing","handoff","daily_brief","priority"]'::jsonb,
   '["no_price_change","no_refund","no_production_deploy","no_delete_data","no_self_approval"]'::jsonb),
  ('sales', 'AI Sales', 'Sales Room', 'Lead, kebutuhan, brief, rekomendasi layanan, draft penawaran, follow-up.', false,
   '["lead_management","brief","quotation_draft","follow_up"]'::jsonb,
   '["no_discount_without_approval","no_base_price_change","no_out_of_scope_promise"]'::jsonb),
  ('project-manager', 'AI Project Manager', 'Project Room', 'Project planning, task, timeline, progress, revisi, status.', false,
   '["project_planning","task_breakdown","timeline","revision_tracking"]'::jsonb,
   '["revision_limit_enforced","scope_change_requires_approval"]'::jsonb),
  ('creative', 'AI Creative', 'Creative Room', 'UI/UX, branding, copy, caption, content planning, creative brief.', false,
   '["ui_ux","branding","copywriting","content_planning"]'::jsonb,
   '["brand_identity_locked_without_approval"]'::jsonb),
  ('finance', 'AI Finance', 'Finance Room', 'Transaksi, DP, pelunasan, invoice draft, omzet, piutang.', false,
   '["finance_read","reporting","invoice_draft","receivable_tracking"]'::jsonb,
   '["no_auto_refund","no_transaction_delete","no_payment_claim_without_evidence"]'::jsonb),
  ('reviewer', 'AI Reviewer', 'Review Room', 'Quality control independen untuk fungsi, UI, responsif, typo, harga, deadline, link, form, handover.', false,
   '["quality_control","handover_review","scope_review"]'::jsonb,
   '["cannot_self_review_primary_work"]'::jsonb),
  ('developer', 'AI Developer', 'Owner Room', 'Asisten teknis pribadi owner untuk coding, audit, database, integrasi, deployment, security, maintenance.', true,
   '["coding","code_audit","database","integrations","github","vercel","deployment","security","logs","performance"]'::jsonb,
   '["owner_only","production_deploy_requires_approval","migration_requires_approval","delete_requires_approval","env_change_requires_approval","security_change_requires_approval"]'::jsonb);

insert into public.knowledge_documents (category, title, content, version)
values
  ('Brand', 'Identitas Teman Digital',
   'Tagline: Bangun Lebih Baik. Tumbuh Lebih Cepat. Palet: Navy #0F2747, Blue #2563EB, Cyan #38BDF8, Light #E5E7EB. UI harus premium, clean, modern, elegan, tech, responsif, dan berbahasa Indonesia.', 1),
  ('Pricing', 'Harga Produk Jadi',
   'Dailyn Rp39.000; Growva Rp39.000; Menuju Kita Rp49.000; KelasKita Rp99.000.', 1),
  ('SOP', 'Jasa Custom',
   'Landing Page mulai Rp150.000, 2–4 hari kerja, maksimal 5 revisi. Dashboard mulai Rp249.000, 4–7 hari kerja, maksimal 5 revisi. Web Custom mulai Rp399.000, maksimal 7 hari kerja, maksimal 10 revisi. Waktu dihitung setelah brief, bahan, dan DP lengkap. Pembayaran 50% DP dan 50% sebelum handover final.', 1),
  ('SOP', 'Garansi',
   'Garansi selamanya hanya untuk bug/error pada fitur yang termasuk scope awal. Penambahan fitur, revisi melebihi batas, atau perubahan scope adalah pekerjaan baru/biaya tambahan.', 1);
