import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional(),
  service: z.string().min(1),
  message: z.string().trim().min(10).max(1000),
  consent: z.literal(true),
});

export const submitContactForm = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error("Dados inválidos. Verifique os campos.");
  // TODO: Integrate with email service or CRM
  console.log("[Contact Form]", JSON.stringify(parsed.data, null, 2));
  return { success: true };
});
