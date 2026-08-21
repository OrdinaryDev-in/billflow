-- Row Level Security: every tenant-owned table is scoped to organization
-- membership via private.is_organization_member(). Public document routes
-- (/q/[token], /i/[token]) never use these policies directly — they go
-- through the service-role client after validating the token server-side,
-- so no anon-readable-by-token policies are needed here.

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.quotation_approval_events enable row level security;
alter table public.milestones enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.recurring_invoice_schedules enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: a user can only read/update their own profile row -------------
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- organizations -------------------------------------------------------------
create policy organizations_select_member on public.organizations
  for select to authenticated
  using (private.is_organization_member(id));

create policy organizations_insert_authenticated on public.organizations
  for insert to authenticated
  with check (true); -- any signed-in user may create an org; ownership is granted via the membership row created in the same transaction

create policy organizations_update_admin on public.organizations
  for update to authenticated
  using (private.has_organization_role(id, array['owner', 'admin']))
  with check (private.has_organization_role(id, array['owner', 'admin']));

create policy organizations_delete_owner on public.organizations
  for delete to authenticated
  using (private.has_organization_role(id, array['owner']));

-- organization_members ------------------------------------------------------
create policy organization_members_select_member on public.organization_members
  for select to authenticated
  using (private.is_organization_member(organization_id));

create policy organization_members_insert_self_or_admin on public.organization_members
  for insert to authenticated
  with check (
    -- allow the very first membership row (org creation) for yourself
    user_id = (select auth.uid())
    or private.has_organization_role(organization_id, array['owner', 'admin'])
  );

create policy organization_members_update_admin on public.organization_members
  for update to authenticated
  using (private.has_organization_role(organization_id, array['owner', 'admin']))
  with check (private.has_organization_role(organization_id, array['owner', 'admin']));

create policy organization_members_delete_admin on public.organization_members
  for delete to authenticated
  using (private.has_organization_role(organization_id, array['owner', 'admin']));

-- generic per-organization CRUD policy, reused for every remaining table ----
do $$
declare
  t text;
begin
  foreach t in array array[
    'clients', 'projects', 'quotations', 'invoices',
    'payments', 'recurring_invoice_schedules', 'activity_logs'
  ]
  loop
    execute format(
      $p$create policy %1$I_select_member on public.%1$I for select to authenticated using (private.is_organization_member(organization_id))$p$,
      t
    );
    execute format(
      $p$create policy %1$I_insert_member on public.%1$I for insert to authenticated with check (private.is_organization_member(organization_id))$p$,
      t
    );
    execute format(
      $p$create policy %1$I_update_member on public.%1$I for update to authenticated using (private.is_organization_member(organization_id)) with check (private.is_organization_member(organization_id))$p$,
      t
    );
    execute format(
      $p$create policy %1$I_delete_member on public.%1$I for delete to authenticated using (private.is_organization_member(organization_id))$p$,
      t
    );
  end loop;
end $$;

-- quotation_items: scoped via the parent quotation's organization -----------
create policy quotation_items_select_member on public.quotation_items
  for select to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_items.quotation_id
        and private.is_organization_member(q.organization_id)
    )
  );

create policy quotation_items_write_member on public.quotation_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_items.quotation_id
        and private.is_organization_member(q.organization_id)
    )
  );

create policy quotation_items_update_member on public.quotation_items
  for update to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_items.quotation_id
        and private.is_organization_member(q.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_items.quotation_id
        and private.is_organization_member(q.organization_id)
    )
  );

create policy quotation_items_delete_member on public.quotation_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_items.quotation_id
        and private.is_organization_member(q.organization_id)
    )
  );

-- quotation_approval_events: read-only to org members, written by the
-- service-role client from the public quotation route handler only.
create policy quotation_approval_events_select_member on public.quotation_approval_events
  for select to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_approval_events.quotation_id
        and private.is_organization_member(q.organization_id)
    )
  );

-- milestones: scoped via the parent project's organization ------------------
create policy milestones_select_member on public.milestones
  for select to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and private.is_organization_member(p.organization_id)
    )
  );

create policy milestones_insert_member on public.milestones
  for insert to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and private.is_organization_member(p.organization_id)
    )
  );

create policy milestones_update_member on public.milestones
  for update to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and private.is_organization_member(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and private.is_organization_member(p.organization_id)
    )
  );

create policy milestones_delete_member on public.milestones
  for delete to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and private.is_organization_member(p.organization_id)
    )
  );

-- invoice_items: scoped via the parent invoice's organization ---------------
create policy invoice_items_select_member on public.invoice_items
  for select to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and private.is_organization_member(i.organization_id)
    )
  );

create policy invoice_items_insert_member on public.invoice_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and private.is_organization_member(i.organization_id)
    )
  );

create policy invoice_items_update_member on public.invoice_items
  for update to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and private.is_organization_member(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and private.is_organization_member(i.organization_id)
    )
  );

create policy invoice_items_delete_member on public.invoice_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and private.is_organization_member(i.organization_id)
    )
  );
