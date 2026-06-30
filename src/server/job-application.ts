import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { validateEnv } from "@/lib/resend";
import { sendApplicationEmail } from "@/lib/email/sendApplicationEmail";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  role: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});

export const submitApplication = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Dados inválidos. Verifique os campos e tente novamente.",
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
    await sendApplicationEmail(parsed.data);
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
