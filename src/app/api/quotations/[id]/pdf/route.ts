import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadQuotationPdfData } from "@/lib/pdf/quotation-pdf-data";
import { renderQuotationPdf } from "@/lib/pdf/render-quotation-pdf";
import { uploadGeneratedDocument } from "@/lib/pdf/storage";

/**
 * Authenticated PDF download for a quotation. Access is enforced by RLS —
 * the query below only returns a row if the signed-in user belongs to the
 * owning organization.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const result = await loadQuotationPdfData(supabase, id);
  if (!result) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const buffer = await renderQuotationPdf(result.data);
  const signedUrl = await uploadGeneratedDocument({
    organizationId: result.organizationId,
    kind: "quotations",
    id,
    buffer,
  });

  return NextResponse.redirect(signedUrl);
}
