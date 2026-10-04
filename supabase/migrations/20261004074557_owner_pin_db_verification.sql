drop function if exists public.owner_pin_status();
drop function if exists public.record_owner_pin_attempt(boolean);

create or replace function public.verify_owner_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data private.owner_pin_security%rowtype;
  next_failed integer;
begin
  select * into row_data
  from private.owner_pin_security
  where key = 'owner'
  for update;

  if not found or row_data.pin_hash is null then
    return jsonb_build_object('ok', false, 'reason', 'not_configured');
  end if;

  if row_data.locked_until is not null and row_data.locked_until > now() then
    return jsonb_build_object(
      'ok', false,
      'reason', 'locked',
      'retry_after_seconds',
      greatest(1, ceil(extract(epoch from (row_data.locked_until - now())))::integer)
    );
  end if;

  if crypt(p_pin, row_data.pin_hash) = row_data.pin_hash then
    update private.owner_pin_security
    set failed_attempts = 0,
        locked_until = null,
        last_attempt_at = now(),
        updated_at = now()
    where key = 'owner';

    return jsonb_build_object('ok', true, 'reason', 'verified');
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
      'reason', 'locked',
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
    'reason', 'invalid',
    'attempts_remaining', 5 - next_failed
  );
end;
$$;

revoke all on function public.verify_owner_pin(text) from public, anon, authenticated;
grant execute on function public.verify_owner_pin(text) to service_role;
