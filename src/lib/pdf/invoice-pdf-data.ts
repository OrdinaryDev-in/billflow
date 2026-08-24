import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { InvoicePdfData } from "@/lib/pdf/invoice-document";

const INVOICE_PDF_SELECT =
  "id, organization_id, updated_at, invoice_number, issue_date, due_date, po_number, currency, subtotal, discount_total, tax_total, grand_total, amount_paid, balance_due, notes, terms, invoice_items(*), clients(name, email), organizations(name, email, phone, gstin, address_line_1, address_line_2, city, state, pincode, bank_account_name, bank_account_number, bank_ifsc, bank_name, upi_id)";

export async function loadInvoicePdfData(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
): Promise<{ organizationId: string; updatedAt: string; data: InvoicePdfData } | null> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(INVOICE_PDF_SELECT)
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) return null;

  return {
    organizationId: invoice.organization_id,
    updatedAt: invoice.updated_at,
    data: {
      invoice,
      items: invoice.invoice_items ?? [],
      organization: invoice.organizations,
      client: invoice.clients,
    },
  };
}
