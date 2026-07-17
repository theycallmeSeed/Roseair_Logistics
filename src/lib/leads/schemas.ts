import { z } from "zod";

const baseFields = {
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  _hp_: z.string().optional(),
};

export const contactLeadSchema = z.object({
  ...baseFields,
  type: z.literal("contact"),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional(),
  service: z.string().min(1),
  message: z.string().trim().min(10).max(1000),
  consent: z.literal(true),
});

export const proposalLeadSchema = z.object({
  ...baseFields,
  type: z.literal("proposal"),
  phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(120).optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  currency: z.string().optional(),
  cargoCategory: z.string().optional(),
  clearanceType: z.string().optional(),
  declaredFreight: z.string().optional(),
  preselectedService: z.string().optional(),
  exchangeRate: z.number().optional(),
  fob: z.number().optional(),
  freight: z.number().optional(),
  insurance: z.number().optional(),
  cif: z.number().optional(),
  cifMt: z.number().optional(),
  da: z.number().optional(),
  ice: z.number().optional(),
  iva: z.number().optional(),
  sobretaxa: z.number().optional(),
  fee: z.number().optional(),
  totalTaxes: z.number().optional(),
  total: z.number().optional(),
});

export const applicationLeadSchema = z.object({
  ...baseFields,
  type: z.literal("application"),
  role: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});

export const leadSchema = z.discriminatedUnion("type", [
  contactLeadSchema,
  proposalLeadSchema,
  applicationLeadSchema,
]);

export type LeadInput = z.infer<typeof leadSchema>;

export type Lead = LeadInput & { submittedAt: string };

export type SubmitResult = {
  success: boolean;
  message: string;
};

export type StoreResult = { success: true; id?: string } | { success: false; error: string };
