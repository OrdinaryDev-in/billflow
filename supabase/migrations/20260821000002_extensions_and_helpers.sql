-- Extensions
create extension if not exists pgcrypto with schema extensions;

-- Private schema for internal helper functions that must not be callable
-- directly by client roles (anon/authenticated). RLS policies call these
-- via `select private.fn(...)`.
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

-- Returns true when the currently authenticated user belongs to the given
-- organization. SECURITY DEFINER so it can read organization_members even
-- when the calling role's RLS on that table would otherwise block it, but
-- it always re-checks the caller's own identity via auth.uid() internally.
create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_organization_member(uuid) from public, anon;
grant execute on function private.is_organization_member(uuid) to authenticated;

-- Returns true when the currently authenticated user belongs to the given
-- organization with at least one of the given roles.
create or replace function private.has_organization_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = (select auth.uid())
      and m.role = any(allowed_roles)
  );
$$;

revoke execute on function private.has_organization_role(uuid, text[]) from public, anon;
grant execute on function private.has_organization_role(uuid, text[]) to authenticated;

-- Generic updated_at maintenance trigger, reused by every table below.
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

-- updated_at triggers, applied now that both the tables (migration 1) and
-- this function exist.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'organizations', 'clients', 'projects', 'quotations',
    'quotation_items', 'milestones', 'invoices', 'payments',
    'recurring_invoice_schedules'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at();',
      t
    );
  end loop;
end $$;
