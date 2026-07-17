import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { leadSchema } from "@/lib/leads/schemas";
import type { Lead, SubmitResult } from "@/lib/leads/schemas";
import { saveLead } from "@/lib/leads/store";
import { checkRateLimit } from "@/lib/rateLimit";

const MESSAGES: Record<string, string> = {
  contact: "Mensagem enviada! A nossa equipa responderá em breve.",
  proposal: "Pedido enviado! Entraremos em contacto em breve.",
  application: "Candidatura enviada! Entraremos em contacto.",
};

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator(leadSchema)
  .handler(async ({ data }): Promise<SubmitResult> => {
    if (data._hp_) {
      return { success: true, message: MESSAGES[data.type] };
    }

    const ipKey = getRequestIP() ?? "unknown";
    if (!checkRateLimit(ipKey).allowed) {
      return {
        success: false,
        message: "Muitas tentativas. Tente novamente mais tarde.",
      };
    }

    const lead = { ...data, submittedAt: new Date().toISOString() } as Lead;

    const result = await saveLead(lead);
    if (!result.success) {
      console.error("[submitLead] Failed to save lead:", result.error);
      return {
        success: false,
        message: "Ocorreu um erro. Tente novamente mais tarde.",
      };
    }

    return { success: true, message: MESSAGES[data.type] };
  });
