import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPdfDocument, type QuotationPdfData } from "@/lib/pdf/quotation-document";

export async function renderQuotationPdf(data: QuotationPdfData): Promise<Buffer> {
  return renderToBuffer(QuotationPdfDocument(data));
}
