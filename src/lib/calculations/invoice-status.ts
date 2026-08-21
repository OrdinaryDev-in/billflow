/**
 * Computes the status an invoice should *display* as, layering "overdue"
 * on top of the persisted status when the due date has passed and the
 * invoice is still unpaid. The underlying `invoices.status` column is left
 * alone here — a scheduled job can reconcile it later (see product plan
 * Phase 8 "Update overdue statuses").
 */
export function effectiveInvoiceStatus(status: string, dueDate: string | null): string {
  if (!dueDate) return status;
  if (!["sent", "viewed", "partially_paid"].includes(status)) return status;

  const isPastDue = new Date(dueDate + "T23:59:59") < new Date();
  return isPastDue ? "overdue" : status;
}
