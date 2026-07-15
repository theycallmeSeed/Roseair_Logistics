import { useState, useRef } from "react";
import { toast } from "sonner";
import { submitLead } from "@/server/submit-lead";
import { buildWhatsAppMessage } from "./message";
import type { Lead, SubmitResult, LeadInput } from "./schemas";

type UseLeadSubmitResult = {
  submit: (data: LeadInput) => Promise<SubmitResult>;
  submitting: boolean;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
  reset: () => void;
  hpProps: Record<string, unknown>;
  lastLead: Lead | null;
  whatsappUrl: string | undefined;
};

export function useLeadSubmit(): UseLeadSubmitResult {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastLead, setLastLead] = useState<Lead | null>(null);
  const hpRef = useRef<HTMLInputElement>(null);

  const submit = async (data: LeadInput): Promise<SubmitResult> => {
    setSubmitting(true);
    try {
      const payload = { ...data, _hp_: hpRef.current?.value ?? "" };
      const response = await submitLead({ data: payload as LeadInput });

      if (response.success) {
        toast.success(response.message);
        setSubmitted(true);
        setLastLead({
          ...data,
          submittedAt: new Date().toISOString(),
        } as Lead);
      } else {
        toast.error(response.message);
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar. Tente novamente.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setLastLead(null);
  };

  const hpProps = {
    ref: hpRef,
    name: "_hp_",
    type: "text",
    tabIndex: -1,
    autoComplete: "off",
    style: {
      position: "absolute" as const,
      left: "-9999px",
      opacity: 0,
      height: 0,
      width: 0,
    },
  };

  const whatsappUrl = lastLead && submitted ? buildWhatsAppMessage(lastLead) : undefined;

  return {
    submit,
    submitting,
    submitted,
    setSubmitted,
    reset,
    hpProps,
    lastLead,
    whatsappUrl,
  };
}
