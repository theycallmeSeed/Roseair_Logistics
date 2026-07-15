import { SITE } from "@/lib/site";
import type { Lead } from "./schemas";

function fmtNum(val: number | undefined | null): string {
  if (val == null) return "-";
  return val.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtCurrency(val: number, currency = "MZN"): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
  }).format(val);
}

export function buildWhatsAppMessage(lead: Lead): string {
  const lines: string[] = [];

  if (lead.type === "contact") {
    lines.push("Olá! Acabei de enviar uma mensagem através do site da Roseair Logistics.");
    lines.push("");
    lines.push(`*Nome:* ${lead.name}`);
    if (lead.company) lines.push(`*Empresa:* ${lead.company}`);
    lines.push(`*Email:* ${lead.email}`);
    lines.push(`*Telefone:* ${lead.phone}`);
    lines.push(`*Serviço:* ${lead.service}`);
    lines.push(`*Mensagem:* ${lead.message}`);
  } else if (lead.type === "proposal") {
    lines.push("Olá! Acabei de solicitar uma proposta personalizada através do simulador.");
    lines.push("");
    lines.push(`*Nome:* ${lead.name}`);
    if (lead.company) lines.push(`*Empresa:* ${lead.company}`);
    lines.push(`*Email:* ${lead.email}`);
    lines.push(`*Telefone:* ${lead.phone}`);
    if (lead.origin) lines.push(`*Origem:* ${lead.origin}`);
    if (lead.destination) lines.push(`*Destino:* ${lead.destination}`);
    if (lead.cargoCategory) lines.push(`*Categoria:* ${lead.cargoCategory}`);
    if (lead.currency) lines.push(`*Moeda:* ${lead.currency}`);
    if (lead.fob != null && lead.fob > 0) {
      lines.push(`*Valor FOB:* ${fmtCurrency(lead.fob, lead.currency ?? "USD")}`);
    }
    if (lead.total != null) {
      lines.push(`*Total Estimado:* ${fmtCurrency(lead.total)}`);
    }
  } else if (lead.type === "application") {
    lines.push("Olá! Acabei de enviar uma candidatura espontânea através do site.");
    lines.push("");
    lines.push(`*Nome:* ${lead.name}`);
    lines.push(`*Email:* ${lead.email}`);
    if (lead.role) lines.push(`*Cargo de Interesse:* ${lead.role}`);
    if (lead.message) lines.push(`*Mensagem:* ${lead.message}`);
  }

  const text = lines.join("\n");
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
