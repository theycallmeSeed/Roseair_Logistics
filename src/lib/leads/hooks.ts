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

    // Create popup synchronously before any async work.
    // Browsers recognise the popup as user-initiated when created inside the
    // same synchronous tick as the click event, dramatically reducing blocking.
    let popup: Window | null = null;
    try {
      popup = window.open("", "_blank");
    } catch {
      popup = null;
    }

    try {
      const payload = { ...data, _hp_: hpRef.current?.value ?? "" };
      const response = await submitLead({ data: payload as LeadInput });

      if (response.success) {
        toast.success(response.message);
        const lead = { ...data, submittedAt: new Date().toISOString() } as Lead;

        const isRealUser = !hpRef.current?.value;
        if (isRealUser) {
          const url = buildWhatsAppMessage(lead);
          if (url && popup && !popup.closed) {
            popup.location.href = url;
          }
        } else {
          // Honeypot triggered — server returned success to avoid detection,
          // but we must not navigate to WhatsApp and must not leave a blank
          // popup open.
          if (popup && !popup.closed) {
            popup.close();
          }
        }

        setSubmitted(true);
        setLastLead(lead);
      } else {
        toast.error(response.message);
        if (popup && !popup.closed) {
          popup.close();
        }
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar. Tente novamente.";
      toast.error(message);
      if (popup && !popup.closed) {
        popup.close();
      }
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
