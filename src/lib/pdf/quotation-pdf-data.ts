import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { QuotationPdfData } from "@/lib/pdf/quotation-document";

const QUOTATION_PDF_SELECT =
  "id, organization_id, quotation_number, issue_date, valid_until, currency, subtotal, discount_total, tax_total, grand_total, scope_of_work, deliverables, timeline, assumptions, exclusions, terms, quotation_items(*), clients(name, email), organizations(name, email, phone, gstin, address_line_1, address_line_2, city, state, pincode, bank_account_name, bank_account_number, bank_ifsc, bank_name, upi_id)";

export async function loadQuotationPdfData(
  supabase: SupabaseClient<Database>,
  quotationId: string,
): Promise<{ organizationId: string; data: QuotationPdfData } | null> {
  const { data: quotation, error } = await supabase
    .from("quotations")
    .select(QUOTATION_PDF_SELECT)
    .eq("id", quotationId)
    .single();

  if (error || !quotation) return null;

  return {
    organizationId: quotation.organization_id,
    data: {
      quotation,
      items: quotation.quotation_items ?? [],
      organization: quotation.organizations,
      client: quotation.clients,
    },
  };
}
