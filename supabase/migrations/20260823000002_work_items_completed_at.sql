-- Keep completed_at in sync with status server-side, so every write path
-- (app, future API, admin fixes) gets this for free instead of relying on
-- application code to remember it.
create or replace function private.sync_work_item_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at = now();
  elsif new.status != 'completed' and old.status is distinct from new.status then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger sync_work_item_completed_at
  before update on public.work_items
  for each row execute function private.sync_work_item_completed_at();

-- Also handle a completed-on-create insert (status passed as 'completed'
-- directly rather than transitioned into it).
create or replace function private.sync_work_item_completed_at_on_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'completed' and new.completed_at is null then
    new.completed_at = now();
  end if;
  return new;
end;
$$;

create trigger sync_work_item_completed_at_on_insert
  before insert on public.work_items
  for each row execute function private.sync_work_item_completed_at_on_insert();
