import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Returns the previously-stored PDF bytes if a copy exists and was rendered
 * at or after `recordUpdatedAt` — i.e. nothing on the invoice/quotation has
 * changed since. Returns null on any cache miss (no stored copy, stale
 * copy, or a storage error), so callers can fall back to re-rendering.
 */
export async function downloadCachedPdfIfFresh(params: {
  organizationId: string;
  kind: "quotations" | "invoices";
  id: string;
  recordUpdatedAt: string;
}): Promise<Buffer | null> {
  const { organizationId, kind, id, recordUpdatedAt } = params;
  const folder = `${organizationId}/${kind}`;
  const filename = `${id}.pdf`;
  const supabase = createAdminClient();

  const { data: files, error: listError } = await supabase.storage
    .from("generated-documents")
    .list(folder, { search: filename });

  if (listError || !files?.length) return null;

  const file = files.find((f) => f.name === filename);
  if (!file?.updated_at) return null;
  if (new Date(file.updated_at).getTime() < new Date(recordUpdatedAt).getTime()) {
    // The record changed after this PDF was rendered — it's stale.
    return null;
  }

  const { data, error: downloadError } = await supabase.storage
    .from("generated-documents")
    .download(`${folder}/${filename}`);

  if (downloadError || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

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

/**
 * Fire-and-forget variant of {@link uploadGeneratedDocument} for callers
 * that stream the PDF straight back to the requester and only want the
 * storage copy kept in sync for later reuse (e.g. resending by email).
 * Failures are logged, not thrown — they must never affect the response
 * the user is waiting on.
 */
export function uploadGeneratedDocumentInBackground(params: {
  organizationId: string;
  kind: "quotations" | "invoices";
  id: string;
  buffer: Buffer;
}): void {
  void uploadGeneratedDocument(params).catch((err) => {
    console.error("uploadGeneratedDocument (background) failed", err);
  });
}
