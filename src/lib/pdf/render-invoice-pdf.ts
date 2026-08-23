import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfDocument, type InvoicePdfData } from "@/lib/pdf/invoice-document";

export async function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return renderToBuffer(InvoicePdfDocument(data));
}
