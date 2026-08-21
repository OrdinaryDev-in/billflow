-- Link invoices back to the recurring schedule that generated them, so the
-- schedule detail page can show a full generation history (not just the
-- single "last_invoice_id" pointer already on recurring_invoice_schedules).
alter table public.invoices
  add column recurring_schedule_id uuid references public.recurring_invoice_schedules(id) on delete set null;

create index invoices_recurring_schedule_id_idx on public.invoices (recurring_schedule_id);
