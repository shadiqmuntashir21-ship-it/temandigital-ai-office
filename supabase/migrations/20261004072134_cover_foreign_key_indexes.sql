create index if not exists idx_activity_logs_actor_agent on public.activity_logs(actor_agent_id);
create index if not exists idx_activity_logs_actor_profile on public.activity_logs(actor_profile_id);

create index if not exists idx_ai_handoffs_task on public.ai_handoffs(ai_task_id);
create index if not exists idx_ai_handoffs_from_agent on public.ai_handoffs(from_agent_id);
create index if not exists idx_ai_handoffs_to_agent on public.ai_handoffs(to_agent_id);

create index if not exists idx_ai_tasks_created_by on public.ai_tasks(created_by);
create index if not exists idx_ai_tasks_parent_task on public.ai_tasks(parent_task_id);

create index if not exists idx_approvals_decided_by on public.approvals(decided_by);
create index if not exists idx_approvals_project on public.approvals(project_id);
create index if not exists idx_approvals_requester_agent on public.approvals(requester_agent_id);
create index if not exists idx_approvals_requester_profile on public.approvals(requester_profile_id);

create index if not exists idx_clients_created_by on public.clients(created_by);

create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_created_by on public.invoices(created_by);
create index if not exists idx_invoices_order on public.invoices(order_id);
create index if not exists idx_invoices_project on public.invoices(project_id);

create index if not exists idx_knowledge_created_by on public.knowledge_documents(created_by);

create index if not exists idx_leads_client on public.leads(client_id);
create index if not exists idx_leads_created_by on public.leads(created_by);

create index if not exists idx_licenses_product on public.licenses(product_id);
create index if not exists idx_orders_product on public.orders(product_id);

create index if not exists idx_project_tasks_assignee_agent on public.project_tasks(assignee_agent_id);
create index if not exists idx_project_tasks_assignee_profile on public.project_tasks(assignee_profile_id);
create index if not exists idx_project_tasks_created_by on public.project_tasks(created_by);

create index if not exists idx_projects_created_by on public.projects(created_by);
create index if not exists idx_projects_lead on public.projects(lead_id);
create index if not exists idx_projects_owner on public.projects(owner_id);

create index if not exists idx_revisions_approval on public.revisions(approval_id);
create index if not exists idx_revisions_requested_by on public.revisions(requested_by);

create index if not exists idx_transactions_client on public.transactions(client_id);
create index if not exists idx_transactions_created_by on public.transactions(created_by);
create index if not exists idx_transactions_verified_by on public.transactions(verified_by);
