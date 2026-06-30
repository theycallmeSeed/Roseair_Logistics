import { getResendClient, getContactEmail, getFromEmail } from "@/lib/resend";
import { contactNotificationHtml, contactConfirmationHtml } from "@/lib/email/templates";

export interface ContactFormInput {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  consent: boolean;
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export async function sendContactEmail(data: ContactFormInput, meta?: RequestMeta): Promise<void> {
  const resend = getResendClient();
  const from = `Roseair Logistics <${getFromEmail()}>`;
  const contactEmail = getContactEmail();

  await resend.emails.send({
    from,
    to: contactEmail,
    subject: `Nova mensagem de contacto — ${data.name}`,
    html: contactNotificationHtml({ ...data, ip: meta?.ip, userAgent: meta?.userAgent }),
  });

  await resend.emails.send({
    from,
    to: data.email,
    subject: "Recebemos a sua mensagem",
    html: contactConfirmationHtml(data.name),
  });
}
