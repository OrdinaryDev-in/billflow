-- Phase 8 hardening: index the remaining unindexed foreign key columns
-- flagged by the Supabase performance advisor (0001_unindexed_foreign_keys).
create index if not exists activity_logs_actor_user_id_idx on public.activity_logs (actor_user_id);
create index if not exists invoices_created_by_idx on public.invoices (created_by);
create index if not exists payments_created_by_idx on public.payments (created_by);
create index if not exists quotations_created_by_idx on public.quotations (created_by);
create index if not exists recurring_invoice_schedules_last_invoice_id_idx on public.recurring_invoice_schedules (last_invoice_id);
