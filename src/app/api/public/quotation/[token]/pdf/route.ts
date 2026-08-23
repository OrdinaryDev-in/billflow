import { NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadQuotationPdfData } from "@/lib/pdf/quotation-pdf-data";
import { renderQuotationPdf } from "@/lib/pdf/render-quotation-pdf";
import { uploadGeneratedDocumentInBackground } from "@/lib/pdf/storage";

/**
 * Public PDF download for a quotation, gated by its unguessable token.
 *
 * The rendered buffer is streamed straight back to the caller; storing a
 * copy in Supabase Storage happens in the background so it doesn't add
 * extra network round trips to the response the user is waiting on.
 */
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

  // Runs after the response is flushed — keeps the storage copy in sync
  // for reuse without adding latency to the download itself.
  after(() =>
    uploadGeneratedDocumentInBackground({
      organizationId: result.organizationId,
      kind: "quotations",
      id: quotation.id,
      buffer,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.id}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
