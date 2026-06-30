import { getResendClient, getContactEmail, getFromEmail } from "@/lib/resend";
import { applicationNotificationHtml, applicationConfirmationHtml } from "@/lib/email/templates";

export interface ApplicationFormInput {
  name: string;
  email: string;
  role?: string;
  message?: string;
}

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
