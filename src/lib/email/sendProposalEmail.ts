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
import { proposalNotificationHtml, proposalConfirmationHtml } from "@/lib/email/templates";

/**
 * @deprecated
 *
 * Legacy Resend implementation.
 *
 * Not used by the application.
 *
 * Kept temporarily for rollback purposes.
 */
export interface ProposalFormInput {
  name: string;
  email: string;
  phone: string;
  company?: string;
  origin?: string;
  destination?: string;
  currency?: string;
  cargoCategory?: string;
  clearanceType?: string;
  declaredFreight?: string;
  exchangeRate?: number;
  fob?: number;
  freight?: number;
  insurance?: number;
  cif?: number;
  cifMt?: number;
  da?: number;
  ice?: number;
  iva?: number;
  sobretaxa?: number;
  fee?: number;
  totalTaxes?: number;
  total?: number;
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
export async function sendProposalEmail(data: ProposalFormInput): Promise<void> {
  const resend = getResendClient();
  const from = `Roseair Logistics <${getFromEmail()}>`;
  const contactEmail = getContactEmail();

  await resend.emails.send({
    from,
    to: contactEmail,
    subject: `Pedido de proposta — ${data.name}`,
    html: proposalNotificationHtml(data),
  });

  await resend.emails.send({
    from,
    to: data.email,
    subject: "Recebemos o seu pedido de proposta",
    html: proposalConfirmationHtml(data.name),
  });
}
