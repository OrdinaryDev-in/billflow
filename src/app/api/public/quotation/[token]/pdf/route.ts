import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadQuotationPdfData } from "@/lib/pdf/quotation-pdf-data";
import { renderQuotationPdf } from "@/lib/pdf/render-quotation-pdf";
import { uploadGeneratedDocument } from "@/lib/pdf/storage";

/** Public PDF download for a quotation, gated by its unguessable token. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quotation, error } = await supabase
    .from("quotations")
    .select("id")
    .eq("public_token", token)
    .single();

  if (error || !quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const result = await loadQuotationPdfData(supabase, quotation.id);
  if (!result) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const buffer = await renderQuotationPdf(result.data);
  const signedUrl = await uploadGeneratedDocument({
    organizationId: result.organizationId,
    kind: "quotations",
    id: quotation.id,
    buffer,
  });

  return NextResponse.redirect(signedUrl);
}
