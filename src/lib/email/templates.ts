import { formatCurrency } from "@/lib/calculations/quotation";

function layout(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:8px;border:1px solid #e5e5e5;overflow:hidden;">
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="font-size:12px;color:#999999;margin-top:16px;">Sent via Billflow</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">${label}</a>`;
}

export function quotationSentEmail(params: {
  organizationName: string;
  clientName: string;
  quotationNumber: string;
  grandTotal: number;
  currency: string;
  publicUrl: string;
}): { subject: string; html: string } {
  const { organizationName, clientName, quotationNumber, grandTotal, currency, publicUrl } = params;
  return {
    subject: `Quotation ${quotationNumber} from ${organizationName}`,
    html: layout(`
      <h1 style="font-size:18px;margin:0 0 12px;">Hi ${escapeHtml(clientName)},</h1>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;">
        ${escapeHtml(organizationName)} has sent you quotation <strong>${escapeHtml(quotationNumber)}</strong>
        for <strong>${formatCurrency(grandTotal, currency)}</strong>.
      </p>
      <p style="font-size:14px;line-height:1.6;margin:0;">
        Review the details, download the PDF, and respond directly from the link below.
      </p>
      ${button(publicUrl, "View quotation")}
    `),
  };
}

export function quotationDecisionEmail(params: {
  quotationNumber: string;
  clientName: string;
  action: "accepted" | "rejected" | "changes_requested";
  clientMessage?: string | null;
  appUrl: string;
}): { subject: string; html: string } {
  const { quotationNumber, clientName, action, clientMessage, appUrl } = params;
  const verb =
    action === "accepted" ? "accepted" : action === "rejected" ? "declined" : "requested changes to";
  return {
    subject: `${clientName} ${verb} quotation ${quotationNumber}`,
    html: layout(`
      <h1 style="font-size:18px;margin:0 0 12px;">${escapeHtml(clientName)} ${verb} ${escapeHtml(quotationNumber)}</h1>
      ${
        clientMessage
          ? `<p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#333333;">"${escapeHtml(clientMessage)}"</p>`
          : ""
      }
      ${button(appUrl, "Open in Billflow")}
    `),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
