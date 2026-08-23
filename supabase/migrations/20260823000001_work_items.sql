-- Work Items: lightweight per-project task tracking. See
-- docs/build-plan.md section "Work Items" for the product rationale.
create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_status_check check (status in ('todo', 'in_progress', 'blocked', 'completed')),
  constraint work_items_priority_check check (priority in ('low', 'medium', 'high', 'urgent'))
);

comment on table public.work_items is 'One actionable unit of work inside a project — not a general task/PM system. See docs/build-plan.md.';

create index idx_work_items_organization_id on public.work_items (organization_id);
create index idx_work_items_project_id on public.work_items (project_id);
create index idx_work_items_status on public.work_items (status);
create index idx_work_items_due_date on public.work_items (due_date);
create index idx_work_items_org_status on public.work_items (organization_id, status);
create index idx_work_items_created_by on public.work_items (created_by);

-- Reuse the existing updated_at trigger function from migration 0002.
create trigger set_updated_at before update on public.work_items
  for each row execute function private.set_updated_at();

-- RLS: same organization-membership model as every other tenant table.
alter table public.work_items enable row level security;

create policy work_items_select_member on public.work_items
  for select to authenticated
  using (private.is_organization_member(organization_id));

create policy work_items_insert_member on public.work_items
  for insert to authenticated
  with check (
    private.is_organization_member(organization_id)
    and exists (
      select 1 from public.projects p
      where p.id = work_items.project_id
        and p.organization_id = work_items.organization_id
    )
  );

create policy work_items_update_member on public.work_items
  for update to authenticated
  using (private.is_organization_member(organization_id))
  with check (private.is_organization_member(organization_id));

create policy work_items_delete_member on public.work_items
  for delete to authenticated
  using (private.is_organization_member(organization_id));
