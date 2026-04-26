import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

export function WhatsAppFAB() {
  return (
    <a
      href={SITE.whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale connosco no WhatsApp"
      title="Fale connosco no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.7_0.18_145)] text-white shadow-card-hover animate-pulse-ring transition-transform hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
