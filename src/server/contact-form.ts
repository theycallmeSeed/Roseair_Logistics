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

import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { validateEnv } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendContactEmail } from "@/lib/email/sendContactEmail";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional(),
  service: z.string().min(1),
  message: z.string().trim().min(10).max(1000),
  consent: z.literal(true),
  _hp_: z.string().optional(),
});

/**
 * @deprecated
 *
 * Legacy Resend implementation.
 *
 * Not used by the application.
 *
 * Kept temporarily for rollback purposes.
 */
export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    if (data._hp_) {
      return {
        success: true,
        message: "Mensagem enviada! A nossa equipa responderá em breve.",
      };
    }

    const ip = getRequestIP() ?? "unknown";
    if (!checkRateLimit(ip).allowed) {
      return {
        success: false,
        message: "Muitas tentativas. Tente novamente mais tarde.",
      };
    }

    const missing = validateEnv();
    if (missing.length > 0) {
      console.error(`[submitContactForm] Missing env vars: ${missing.join(", ")}`);
      return {
        success: false,
        message:
          "O formulário de contacto está temporariamente indisponível. Tente novamente mais tarde.",
      };
    }

    try {
      await sendContactEmail(data, { ip });
      return {
        success: true,
        message: "Mensagem enviada! A nossa equipa responderá em breve.",
      };
    } catch (error) {
      console.error("[submitContactForm] Failed to send email", error);
      return {
        success: false,
        message: "Ocorreu um erro ao enviar a sua mensagem. Tente novamente mais tarde.",
      };
    }
  });
