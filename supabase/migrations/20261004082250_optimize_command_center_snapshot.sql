create or replace function public.command_center_snapshot(p_month_start timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'orders', (
      select count(*) from public.orders
      where status <> 'dibatalkan'
    ),
    'leads', (
      select count(*) from public.leads
      where status in ('lead_baru','konsultasi','penawaran','menunggu_dp')
    ),
    'projects', (
      select count(*) from public.projects
      where status not in ('selesai','dibatalkan')
    ),
    'approvals', (
      select count(*) from public.approvals
      where status = 'menunggu'
    ),
    'review', (
      select count(*) from public.projects
      where status in ('revisi','handover')
    ),
    'finance_pending', (
      select count(*) from public.transactions
      where status = 'pending'
    ),
    'revenue', (
      select coalesce(sum(amount),0)
      from public.transactions
      where status = 'terverifikasi'
        and occurred_at >= p_month_start
        and type in ('pemasukan','dp','pelunasan')
    )
  );
$$;

revoke all on function public.command_center_snapshot(timestamptz) from public;
grant execute on function public.command_center_snapshot(timestamptz) to anon, authenticated;
