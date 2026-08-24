import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadInvoicePdfData } from "@/lib/pdf/invoice-pdf-data";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
import { downloadCachedPdfIfFresh, uploadGeneratedDocumentInBackground } from "@/lib/pdf/storage";

/**
 * Authenticated PDF download for an invoice. Access is enforced by RLS —
 * the query below only returns a row if the signed-in user belongs to the
 * owning organization.
 *
 * The rendered buffer is streamed straight back to the caller; storing a
 * copy in Supabase Storage happens in the background so it doesn't add
 * extra network round trips to the response the user is waiting on.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const result = await loadInvoicePdfData(supabase, id);
  if (!result) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Invoices are immutable once sent; reuse the last render instead of
  // paying render+upload cost again if nothing has changed since.
  const cached = await downloadCachedPdfIfFresh({
    organizationId: result.organizationId,
    kind: "invoices",
    id,
    recordUpdatedAt: result.updatedAt,
  });

  const buffer = cached ?? (await renderInvoicePdf(result.data));

  if (!cached) {
    // Runs after the response is flushed — keeps the storage copy in sync
    // for reuse without adding latency to the download itself.
    after(() =>
      uploadGeneratedDocumentInBackground({
        organizationId: result.organizationId,
        kind: "invoices",
        id,
        buffer,
      }),
    );
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${id}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
