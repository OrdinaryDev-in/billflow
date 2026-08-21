-- Auto-create a profile row whenever a new auth user signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Atomically claim the next invoice number for an organization, formatted
-- as "<prefix>-<number>" (e.g. INV-000042). Must be called from inside the
-- same transaction that inserts the invoice row so a failure rolls back
-- the counter too.
create or replace function public.next_invoice_number(target_organization_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed integer;
  prefix text;
begin
  if not private.is_organization_member(target_organization_id) then
    raise exception 'not a member of this organization';
  end if;

  update public.organizations
  set next_invoice_number = next_invoice_number + 1
  where id = target_organization_id
  returning next_invoice_number - 1, invoice_prefix into claimed, prefix;

  if claimed is null then
    raise exception 'organization % not found', target_organization_id;
  end if;

  return prefix || '-' || lpad(claimed::text, 6, '0');
end;
$$;

revoke execute on function public.next_invoice_number(uuid) from public, anon;
grant execute on function public.next_invoice_number(uuid) to authenticated;

-- Same for quotations.
create or replace function public.next_quotation_number(target_organization_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed integer;
  prefix text;
begin
  if not private.is_organization_member(target_organization_id) then
    raise exception 'not a member of this organization';
  end if;

  update public.organizations
  set next_quotation_number = next_quotation_number + 1
  where id = target_organization_id
  returning next_quotation_number - 1, quotation_prefix into claimed, prefix;

  if claimed is null then
    raise exception 'organization % not found', target_organization_id;
  end if;

  return prefix || '-' || lpad(claimed::text, 6, '0');
end;
$$;

revoke execute on function public.next_quotation_number(uuid) from public, anon;
grant execute on function public.next_quotation_number(uuid) to authenticated;

-- Keep invoice amount_paid / balance_due / status in sync whenever a
-- payment is inserted, updated or deleted. Runs as SECURITY DEFINER so it
-- can update the invoice row regardless of the caller's own RLS grants
-- (the caller must still pass the invoice_items/payments RLS checks to
-- reach this trigger in the first place).
create or replace function private.recalculate_invoice_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_invoice_id uuid;
  paid numeric(15, 2);
  total numeric(15, 2);
  new_status text;
begin
  target_invoice_id := coalesce(new.invoice_id, old.invoice_id);

  select coalesce(sum(amount), 0) into paid
  from public.payments
  where invoice_id = target_invoice_id
    and status = 'completed';

  select grand_total, status into total, new_status
  from public.invoices
  where id = target_invoice_id;

  if new_status not in ('draft', 'cancelled') then
    new_status := case
      when paid <= 0 then (case when new_status = 'overdue' then 'overdue' else 'sent' end)
      when paid < total then 'partially_paid'
      else 'paid'
    end;
  end if;

  update public.invoices
  set amount_paid = paid,
      balance_due = total - paid,
      status = new_status
  where id = target_invoice_id;

  return coalesce(new, old);
end;
$$;

create trigger recalculate_invoice_totals_on_payment
  after insert or update or delete on public.payments
  for each row execute function private.recalculate_invoice_totals();
