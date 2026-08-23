import "server-only";
import { getResendClient, getEmailFrom } from "@/lib/email/client";
import { quotationSentEmail, quotationDecisionEmail } from "@/lib/email/templates";

export type EmailResult = { sent: boolean; reason?: string };

/**
 * Sends the "quotation sent" email to the client, with the PDF attached.
 * No-ops (returns `{ sent: false }`) when RESEND_API_KEY isn't configured
 * or the client has no email on file — callers should log/record this but
 * must not treat it as a hard failure (the quotation is still shareable
 * via its public link either way).
 */
export async function sendQuotationEmail(params: {
  to: string | null;
  organizationName: string;
  clientName: string;
  quotationNumber: string;
  grandTotal: number;
  currency: string;
  publicUrl: string;
  pdfBuffer?: Buffer;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) return { sent: false, reason: "RESEND_API_KEY not configured" };
  if (!params.to) return { sent: false, reason: "Client has no email on file" };

  const { subject, html } = quotationSentEmail(params);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: params.to,
    subject,
    html,
    attachments: params.pdfBuffer
      ? [
          {
            filename: `${params.quotationNumber}.pdf`,
            content: params.pdfBuffer,
          },
        ]
      : undefined,
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

/** Notifies the organization when a client responds to a quotation. */
export async function sendQuotationDecisionEmail(params: {
  to: string | null;
  quotationNumber: string;
  clientName: string;
  action: "accepted" | "rejected" | "changes_requested";
  clientMessage?: string | null;
  appUrl: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) return { sent: false, reason: "RESEND_API_KEY not configured" };
  if (!params.to) return { sent: false, reason: "Organization has no email on file" };

  const { subject, html } = quotationDecisionEmail(params);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: params.to,
    subject,
    html,
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}
