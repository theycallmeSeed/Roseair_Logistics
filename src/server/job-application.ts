import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  role: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});

export const submitApplication = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error("Dados inválidos. Verifique os campos.");
  console.log("[Job Application]", JSON.stringify(parsed.data, null, 2));
  return { success: true };
});
