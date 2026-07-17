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
import { sendApplicationEmail } from "@/lib/email/sendApplicationEmail";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  role: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
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
export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    if (data._hp_) {
      return {
        success: true,
        message: "Candidatura enviada! Entraremos em contacto.",
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
      console.error(`[submitApplication] Missing env vars: ${missing.join(", ")}`);
      return {
        success: false,
        message:
          "O formulário de candidatura está temporariamente indisponível. Tente novamente mais tarde.",
      };
    }

    try {
      await sendApplicationEmail(data);
      return {
        success: true,
        message: "Candidatura enviada! Entraremos em contacto.",
      };
    } catch (error) {
      console.error("[submitApplication] Failed to send email", error);
      return {
        success: false,
        message: "Ocorreu um erro ao enviar a sua candidatura. Tente novamente mais tarde.",
      };
    }
  });
