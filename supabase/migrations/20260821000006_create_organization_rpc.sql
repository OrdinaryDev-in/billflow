-- Atomically create an organization plus its owner membership row. Used by
-- the onboarding Server Action so a partial failure (org created, no
-- membership) can never happen.
create or replace function public.create_organization_with_owner(
  org_name text,
  org_country text default 'IN',
  org_currency text default 'INR',
  org_timezone text default 'Asia/Kolkata'
)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_org public.organizations;
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  insert into public.organizations (name, country, currency, timezone)
  values (org_name, org_country, org_currency, org_timezone)
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org.id, caller, 'owner');

  return new_org;
end;
$$;

revoke execute on function public.create_organization_with_owner(text, text, text, text) from public, anon;
grant execute on function public.create_organization_with_owner(text, text, text, text) to authenticated;
