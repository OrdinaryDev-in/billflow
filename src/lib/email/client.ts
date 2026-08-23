import "server-only";
import { Resend } from "resend";

let client: Resend | null | undefined;

/**
 * Lazily-created Resend client. Returns null when RESEND_API_KEY isn't
 * configured yet — callers should treat that as "email delivery skipped"
 * rather than an error, so the app works before Resend is wired up (see
 * .env.example).
 */
export function getResendClient(): Resend | null {
  if (client !== undefined) return client;
  const apiKey = process.env.RESEND_API_KEY;
  client = apiKey ? new Resend(apiKey) : null;
  return client;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || "Billflow <no-reply@billflow.app>";
}
