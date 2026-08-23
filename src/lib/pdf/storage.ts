import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Uploads a generated PDF to the `generated-documents` bucket and returns a
 * short-lived signed URL. Always overwrites — quotations/invoices are
 * locked once sent, so re-rendering on every download keeps the PDF in
 * sync with the record without needing cache invalidation.
 */
export async function uploadGeneratedDocument(params: {
  organizationId: string;
  kind: "quotations" | "invoices";
  id: string;
  buffer: Buffer;
}): Promise<string> {
  const { organizationId, kind, id, buffer } = params;
  const path = `${organizationId}/${kind}/${id}.pdf`;
  const supabase = createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from("generated-documents")
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw new Error(`Could not store PDF: ${uploadError.message}`);
  }

  const { data, error: signError } = await supabase.storage
    .from("generated-documents")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (signError || !data) {
    throw new Error(signError?.message ?? "Could not create a download link.");
  }

  return data.signedUrl;
}
