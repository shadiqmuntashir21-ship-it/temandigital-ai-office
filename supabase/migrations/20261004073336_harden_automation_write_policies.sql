drop policy if exists automation_runs_insert_internal on public.automation_runs;
drop policy if exists automation_runs_update_internal on public.automation_runs;
drop policy if exists daily_briefs_insert_self on public.daily_briefs;
drop policy if exists daily_briefs_update_self on public.daily_briefs;
drop policy if exists notifications_insert_internal on public.notifications;

create policy automation_runs_insert_owner on public.automation_runs
for insert to authenticated
with check (private.is_owner());

create policy automation_runs_update_owner on public.automation_runs
for update to authenticated
using (private.is_owner())
with check (private.is_owner());

create policy daily_briefs_insert_owner on public.daily_briefs
for insert to authenticated
with check (private.is_owner());

create policy daily_briefs_update_owner on public.daily_briefs
for update to authenticated
using (private.is_owner())
with check (private.is_owner());

create policy notifications_insert_self_or_owner on public.notifications
for insert to authenticated
with check (profile_id = (select auth.uid()) or private.is_owner());
