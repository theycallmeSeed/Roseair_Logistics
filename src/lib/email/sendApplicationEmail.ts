/**
 * -----------------------------------------------------------------------------
 * LEGACY IMPLEMENTATION
 * -----------------------------------------------------------------------------
 *
 * Status:
 * Deprecated
 *
 * This file belongs to the previous Resend-based lead delivery pipeline.
 *
 * The application now uses:
 *
 *   Forms
 *        ↓
 * useLeadSubmit()
 *        ↓
 * submit-lead.ts
 *        ↓
 * Google Apps Script
 *        ↓
 * Google Sheets
 *        ↓
 * WhatsApp Follow-up
 *
 * This implementation is intentionally kept for rollback purposes.
 *
 * DO NOT import this file into new code.
 *
 * DO NOT extend this implementation.
 *
 * Remove only after the Google Sheets pipeline has been validated in production.
 * -----------------------------------------------------------------------------
 */

import { getResendClient, getContactEmail, getFromEmail } from "@/lib/resend";
import { applicationNotificationHtml, applicationConfirmationHtml } from "@/lib/email/templates";

/**
 * @deprecated
 *
 * Legacy Resend implementation.
 *
 * Not used by the application.
 *
 * Kept temporarily for rollback purposes.
 */
export interface ApplicationFormInput {
  name: string;
  email: string;
  role?: string;
  message?: string;
}

/**
 * @deprecated
 *
 * Legacy Resend implementation.
 *
 * Not used by the application.
 *
 * Kept temporarily for rollback purposes.
 */
export async function sendApplicationEmail(data: ApplicationFormInput): Promise<void> {
  const resend = getResendClient();
  const from = `Roseair Logistics <${getFromEmail()}>`;
  const contactEmail = getContactEmail();

  await resend.emails.send({
    from,
    to: contactEmail,
    subject: `Candidatura espontânea — ${data.name}`,
    html: applicationNotificationHtml(data),
  });

  await resend.emails.send({
    from,
    to: data.email,
    subject: "Recebemos a sua candidatura",
    html: applicationConfirmationHtml(data.name),
  });
}
