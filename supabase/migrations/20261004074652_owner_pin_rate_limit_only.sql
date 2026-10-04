drop function if exists public.verify_owner_pin(text);

create or replace function public.owner_pin_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data private.owner_pin_security%rowtype;
begin
  insert into private.owner_pin_security (key, pin_hash)
  values ('owner', null)
  on conflict (key) do nothing;

  select * into row_data
  from private.owner_pin_security
  where key = 'owner';

  if row_data.locked_until is not null and row_data.locked_until > now() then
    return jsonb_build_object(
      'locked', true,
      'retry_after_seconds',
      greatest(1, ceil(extract(epoch from (row_data.locked_until - now())))::integer)
    );
  end if;

  return jsonb_build_object(
    'locked', false,
    'attempts_remaining', greatest(0, 5 - row_data.failed_attempts)
  );
end;
$$;

create or replace function public.record_owner_pin_attempt(p_success boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data private.owner_pin_security%rowtype;
  next_failed integer;
begin
  insert into private.owner_pin_security (key, pin_hash)
  values ('owner', null)
  on conflict (key) do nothing;

  select * into row_data
  from private.owner_pin_security
  where key = 'owner'
  for update;

  if row_data.locked_until is not null and row_data.locked_until > now() then
    return jsonb_build_object(
      'ok', false,
      'locked', true,
      'retry_after_seconds',
      greatest(1, ceil(extract(epoch from (row_data.locked_until - now())))::integer)
    );
  end if;

  if p_success then
    update private.owner_pin_security
    set failed_attempts = 0,
        locked_until = null,
        last_attempt_at = now(),
        updated_at = now()
    where key = 'owner';

    return jsonb_build_object('ok', true, 'locked', false);
  end if;

  next_failed := row_data.failed_attempts + 1;

  if next_failed >= 5 then
    update private.owner_pin_security
    set failed_attempts = 0,
        locked_until = now() + interval '15 minutes',
        last_attempt_at = now(),
        updated_at = now()
    where key = 'owner';

    return jsonb_build_object(
      'ok', false,
      'locked', true,
      'retry_after_seconds', 900
    );
  end if;

  update private.owner_pin_security
  set failed_attempts = next_failed,
      locked_until = null,
      last_attempt_at = now(),
      updated_at = now()
  where key = 'owner';

  return jsonb_build_object(
    'ok', false,
    'locked', false,
    'attempts_remaining', 5 - next_failed
  );
end;
$$;

revoke all on function public.owner_pin_status() from public, anon, authenticated;
revoke all on function public.record_owner_pin_attempt(boolean) from public, anon, authenticated;
grant execute on function public.owner_pin_status() to service_role;
grant execute on function public.record_owner_pin_attempt(boolean) to service_role;
