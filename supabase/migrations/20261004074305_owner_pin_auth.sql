create table private.owner_pin_security (
  key text primary key default 'owner',
  pin_hash text not null,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_attempt_at timestamptz,
  updated_at timestamptz not null default now()
);

revoke all on private.owner_pin_security from public, anon, authenticated;

create or replace function public.verify_owner_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data private.owner_pin_security%rowtype;
  now_ts timestamptz := now();
  remaining_seconds integer;
begin
  select * into row_data
  from private.owner_pin_security
  where key = 'owner'
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_configured');
  end if;

  if row_data.locked_until is not null and row_data.locked_until > now_ts then
    remaining_seconds := greatest(1, ceil(extract(epoch from (row_data.locked_until - now_ts)))::integer);
    return jsonb_build_object(
      'ok', false,
      'reason', 'locked',
      'retry_after_seconds', remaining_seconds
    );
  end if;

  if crypt(p_pin, row_data.pin_hash) = row_data.pin_hash then
    update private.owner_pin_security
    set failed_attempts = 0,
        locked_until = null,
        last_attempt_at = now_ts,
        updated_at = now_ts
    where key = 'owner';

    return jsonb_build_object('ok', true, 'reason', 'verified');
  end if;

  update private.owner_pin_security
  set failed_attempts = case when failed_attempts >= 4 then 0 else failed_attempts + 1 end,
      locked_until = case when failed_attempts >= 4 then now_ts + interval '15 minutes' else null end,
      last_attempt_at = now_ts,
      updated_at = now_ts
  where key = 'owner';

  return jsonb_build_object(
    'ok', false,
    'reason', case when row_data.failed_attempts >= 4 then 'locked' else 'invalid' end,
    'attempts_remaining', greatest(0, 4 - row_data.failed_attempts),
    'retry_after_seconds', case when row_data.failed_attempts >= 4 then 900 else null end
  );
end;
$$;

revoke all on function public.verify_owner_pin(text) from public, anon, authenticated;
grant execute on function public.verify_owner_pin(text) to service_role;
