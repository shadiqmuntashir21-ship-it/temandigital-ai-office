drop policy if exists notifications_select_self on public.notifications;
drop policy if exists notifications_update_self on public.notifications;

create policy notifications_select_self on public.notifications
for select to authenticated
using (profile_id = (select auth.uid()) or private.is_owner());

create policy notifications_update_self on public.notifications
for update to authenticated
using (profile_id = (select auth.uid()) or private.is_owner())
with check (profile_id = (select auth.uid()) or private.is_owner());
