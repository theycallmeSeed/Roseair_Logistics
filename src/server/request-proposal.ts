import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { validateEnv } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendProposalEmail } from "@/lib/email/sendProposalEmail";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional(),
});

export const submitProposalRequest = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const raw = data as Record<string, unknown>;
  if (typeof raw._hp_ === "string" && raw._hp_.length > 0) {
    return {
      success: true,
      message: "Pedido enviado! Entraremos em contacto em breve.",
    };
  }

  const ip = getRequestIP() ?? "unknown";
  if (!checkRateLimit(ip).allowed) {
    return {
      success: false,
      message: "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Dados inválidos. Verifique os campos e tente novamente.",
    };
  }

  const missing = validateEnv();
  if (missing.length > 0) {
    console.error(`[submitProposalRequest] Missing env vars: ${missing.join(", ")}`);
    return {
      success: false,
      message:
        "O pedido de proposta está temporariamente indisponível. Tente novamente mais tarde.",
    };
  }

  try {
    await sendProposalEmail(parsed.data);
    return {
      success: true,
      message: "Pedido enviado! Entraremos em contacto em breve.",
    };
  } catch (error) {
    console.error("[submitProposalRequest] Failed to send email", error);
    return {
      success: false,
      message: "Ocorreu um erro ao enviar o seu pedido. Tente novamente mais tarde.",
    };
  }
});
