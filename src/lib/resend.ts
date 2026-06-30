import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured. Set the RESEND_API_KEY environment variable.",
      );
    }
    client = new Resend(apiKey);
  }
  return client;
}

export function getContactEmail(): string {
  const email = process.env.CONTACT_EMAIL;
  if (!email) {
    throw new Error("CONTACT_EMAIL is not configured. Set the CONTACT_EMAIL environment variable.");
  }
  return email;
}

export function getFromEmail(): string {
  const email = process.env.FROM_EMAIL;
  if (!email) {
    throw new Error("FROM_EMAIL is not configured. Set the FROM_EMAIL environment variable.");
  }
  return email;
}

export function validateEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.CONTACT_EMAIL) missing.push("CONTACT_EMAIL");
  if (!process.env.FROM_EMAIL) missing.push("FROM_EMAIL");
  return missing;
}
