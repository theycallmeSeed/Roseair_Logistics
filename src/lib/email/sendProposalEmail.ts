import { getResendClient, getContactEmail, getFromEmail } from "@/lib/resend";
import { proposalNotificationHtml, proposalConfirmationHtml } from "@/lib/email/templates";

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
