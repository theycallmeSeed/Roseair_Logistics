import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional(),
});

export const submitProposalRequest = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error("Dados inválidos. Verifique os campos.");
  console.log("[Proposal]", JSON.stringify(parsed.data, null, 2));
  return { success: true };
});
