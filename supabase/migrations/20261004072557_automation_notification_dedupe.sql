alter table public.notifications
  add column if not exists notification_key text,
  add column if not exists automation_rule_id uuid references public.automation_rules(id) on delete set null;

create unique index if not exists idx_notifications_notification_key
  on public.notifications(notification_key)
  where notification_key is not null;

create index if not exists idx_notifications_automation_rule
  on public.notifications(automation_rule_id);
