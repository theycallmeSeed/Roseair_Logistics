function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BRAND_RED = "#CC1C1C";
const NAVY = "#1A2B5C";
const BG_LIGHT = "#F5F5F5";

const COMPANY_NAME = "ROSEAIR LOGISTICS, SA";
const COMPANY_ADDRESS = "Av. Olof Palme, nº 798, 2º andar / direito, Maputo, Moçambique";
const COMPANY_PHONES = ["+258 86 352 7562", "+258 87 70 40 453"];
const COMPANY_EMAIL = "roseair.geral@outlook.com";

function headerHtml(): string {
  return `
    <div style="text-align:center;padding:32px 0 24px;border-bottom:2px solid ${BRAND_RED}">
      <div style="display:inline-block;background:${BRAND_RED}10;border-radius:6px;padding:8px 16px;margin-bottom:8px">
        <span style="font-size:28px;font-weight:900;color:${BRAND_RED};letter-spacing:-0.5px">ROSEAIR</span>
      </div>
      <div style="font-size:11px;font-weight:700;color:${NAVY};letter-spacing:3px;margin-top:2px">LOGISTICS, SA</div>
    </div>`;
}

function footerHtml(): string {
  const phonesHtml = COMPANY_PHONES.map(
    (p) => `<div style="line-height:1.6">${escapeHtml(p)}</div>`,
  ).join("");
  return `
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #ddd;font-size:12px;color:#666">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        <tr>
          <td style="text-align:center;padding-bottom:12px;font-weight:700;color:${NAVY};font-size:13px">
            ${escapeHtml(COMPANY_NAME)}
          </td>
        </tr>
        <tr>
          <td style="text-align:center;padding-bottom:4px;line-height:1.6">
            ${escapeHtml(COMPANY_ADDRESS)}
          </td>
        </tr>
        <tr>
          <td style="text-align:center;line-height:1.6">
            ${phonesHtml}
            <a href="mailto:${COMPANY_EMAIL}" style="color:${BRAND_RED};text-decoration:none">${COMPANY_EMAIL}</a>
          </td>
        </tr>
      </table>
    </div>`;
}

function layoutHtml(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{margin:0;padding:0;background-color:${BG_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  </style>
</head>
<body>
  <table cellpadding="0" cellspacing="0" style="width:100%;background-color:${BG_LIGHT}">
    <tr>
      <td style="padding:20px 12px">
        <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <tr><td style="padding:0 32px">${headerHtml()}</td></tr>
          <tr><td style="padding:24px 32px;font-size:15px;color:#333;line-height:1.7">${bodyContent}</td></tr>
          <tr><td style="padding:0 32px 24px">${footerHtml()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ---------- shared field row helper ---------- */

function fieldRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0;font-size:13px;font-weight:600;color:#888;width:140px;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-size:14px;color:#333">${escapeHtml(value)}</td>
    </tr>`;
}

/* ---------- notification (internal) templates ---------- */

interface ContactNotificationData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  ip?: string;
  userAgent?: string;
}

export function contactNotificationHtml(data: ContactNotificationData): string {
  const rows = [
    fieldRow("Nome", data.name),
    fieldRow("Email", data.email),
    fieldRow("Telefone", data.phone),
    data.company ? fieldRow("Empresa", data.company) : "",
    fieldRow("Serviço", data.service),
  ]
    .filter(Boolean)
    .join("");

  const metaRows = [
    fieldRow("Data/Hora", new Date().toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })),
    data.ip ? fieldRow("IP", data.ip) : "",
    data.userAgent ? fieldRow("User Agent", data.userAgent) : "",
  ]
    .filter(Boolean)
    .join("");

  const messageHtml = escapeHtml(data.message).replace(/\n/g, "<br>");

  return layoutHtml(`
    <h2 style="color:${NAVY};margin:0 0 16px;font-size:20px">Nova Mensagem de Contacto</h2>
    <p style="margin:0 0 20px;color:#555">Um cliente enviou uma nova mensagem através do formulário de contacto.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%">
      <tr><td style="padding-bottom:4px"><h3 style="color:${NAVY};font-size:14px;margin:8px 0 0;border-bottom:1px solid #eee;padding-bottom:6px">Dados do Contacto</h3></td></tr>
      ${rows}
      <tr><td style="padding-bottom:4px"><h3 style="color:${NAVY};font-size:14px;margin:8px 0 0;border-bottom:1px solid #eee;padding-bottom:6px">Mensagem</h3></td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#333;background:${BG_LIGHT};border-radius:4px;padding:12px">${messageHtml}</td></tr>
      <tr><td style="padding-bottom:4px"><h3 style="color:${NAVY};font-size:14px;margin:8px 0 0;border-bottom:1px solid #eee;padding-bottom:6px">Metadados</h3></td></tr>
      ${metaRows}
    </table>`);
}

export function contactConfirmationHtml(name: string): string {
  return layoutHtml(`
    <h2 style="color:${NAVY};margin:0 0 16px;font-size:20px">Recebemos a sua mensagem</h2>
    <p style="margin:0 0 16px">Olá <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px">Agradecemos o seu contacto. Recebemos a sua mensagem e a nossa equipa irá analisá-la com a maior brevidade.</p>
    <p style="margin:0 0 16px">Entraremos em contacto consigo o mais rapidamente possível.</p>
    <p style="margin:0 0 4px">Atenciosamente,</p>
    <p style="margin:0;font-weight:700;color:${NAVY}">Equipa ${escapeHtml(COMPANY_NAME)}</p>`);
}

/* ---------- proposal notification template ---------- */

interface ProposalNotificationData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  origin?: string;
  destination?: string;
  currency?: string;
  cargoCategory?: string;
  clearanceType?: string;
  declaredFreight?: string;
  exchangeRate?: number;
  fob?: number;
  freight?: number;
  insurance?: number;
  cif?: number;
  cifMt?: number;
  da?: number;
  ice?: number;
  iva?: number;
  sobretaxa?: number;
  fee?: number;
  totalTaxes?: number;
  total?: number;
}

const CUR = (data: ProposalNotificationData): string => data.currency ?? "USD";

const CLEARANCE_LABELS: Record<string, string> = {
  normal: "Normal",
  expresso: "Expresso",
  prioritario: "Prioritário",
};

function sectionHeading(label: string): string {
  return `<tr><td style="padding-bottom:4px"><h3 style="color:${NAVY};font-size:14px;margin:8px 0 0;border-bottom:1px solid #eee;padding-bottom:6px">${escapeHtml(label)}</h3></td></tr>`;
}

function fmtNum(val: number | undefined | null): string {
  if (val == null) return "-";
  return val.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function proposalNotificationHtml(data: ProposalNotificationData): string {
  const customerRows = [
    fieldRow("Nome", data.name),
    fieldRow("Email", data.email),
    fieldRow("Telefone", data.phone),
    data.company ? fieldRow("Empresa", data.company) : "",
    fieldRow("Data/Hora", new Date().toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })),
  ]
    .filter(Boolean)
    .join("");

  const shipmentRows = [
    data.origin ? fieldRow("Origem", data.origin) : "",
    data.destination ? fieldRow("Destino", data.destination) : "",
    data.cargoCategory ? fieldRow("Categoria da Mercadoria", data.cargoCategory) : "",
    data.clearanceType
      ? fieldRow("Tipo de Desembaraço", CLEARANCE_LABELS[data.clearanceType] ?? data.clearanceType)
      : "",
    data.declaredFreight
      ? fieldRow("Frete Declarado", `${fmtNum(Number(data.declaredFreight))} ${CUR(data)}`)
      : "",
  ]
    .filter(Boolean)
    .join("");

  const financialRows = [
    data.currency ? fieldRow("Moeda", data.currency) : "",
    data.exchangeRate != null ? fieldRow("Taxa de Câmbio", fmtNum(data.exchangeRate)) : "",
    data.fob != null ? fieldRow("Valor FOB", `${fmtNum(data.fob)} ${data.currency ?? "USD"}`) : "",
  ]
    .filter(Boolean)
    .join("");

  const calcRows = [
    data.freight != null
      ? fieldRow("Frete (estimado)", `${fmtNum(data.freight)} ${CUR(data)}`)
      : "",
    data.insurance != null ? fieldRow("Seguro (2%)", `${fmtNum(data.insurance)} ${CUR(data)}`) : "",
    data.cif != null ? fieldRow("Valor CIF", `${fmtNum(data.cif)} ${CUR(data)}`) : "",
    data.cifMt != null ? fieldRow("Valor CIF (MZN)", `${fmtNum(data.cifMt)} MZN`) : "",
    data.da != null ? fieldRow("Direitos Aduaneiros (D.A.)", `${fmtNum(data.da)} MZN`) : "",
    data.ice != null && data.ice > 0 ? fieldRow("ICE", `${fmtNum(data.ice)} MZN`) : "",
    data.iva != null && data.iva > 0 ? fieldRow("IVA", `${fmtNum(data.iva)} MZN`) : "",
    data.sobretaxa != null && data.sobretaxa > 0
      ? fieldRow("Sobretaxa", `${fmtNum(data.sobretaxa)} MZN`)
      : "",
    data.fee != null ? fieldRow("Taxa de Desembaraço", `${fmtNum(data.fee)} MZN`) : "",
    data.totalTaxes != null ? fieldRow("Total de Impostos", `${fmtNum(data.totalTaxes)} MZN`) : "",
    data.total != null
      ? fieldRow("Total Estimado", `<strong>${fmtNum(data.total)} MZN</strong>`)
      : "",
  ]
    .filter(Boolean)
    .join("");

  return layoutHtml(`
    <h2 style="color:${NAVY};margin:0 0 16px;font-size:20px">Pedido de Proposta</h2>
    <p style="margin:0 0 20px;color:#555">Um cliente solicitou uma proposta personalizada através do simulador.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${sectionHeading("Dados do Cliente")}
      ${customerRows}
      ${shipmentRows ? sectionHeading("Dados do Envio") : ""}
      ${shipmentRows}
      ${financialRows ? sectionHeading("Dados Financeiros") : ""}
      ${financialRows}
      ${calcRows ? sectionHeading("Resultado do Cálculo") : ""}
      ${calcRows}
    </table>`);
}

export function proposalConfirmationHtml(name: string): string {
  return layoutHtml(`
    <h2 style="color:${NAVY};margin:0 0 16px;font-size:20px">Recebemos o seu pedido de proposta</h2>
    <p style="margin:0 0 16px">Olá <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px">Recebemos o seu pedido de proposta personalizada. A nossa equipa comercial irá analisar os detalhes e enviar-lhe uma proposta o mais breve possível.</p>
    <p style="margin:0 0 16px">Se tiver alguma dúvida adicional, não hesite em contactar-nos.</p>
    <p style="margin:0 0 4px">Atenciosamente,</p>
    <p style="margin:0;font-weight:700;color:${NAVY}">Equipa ${escapeHtml(COMPANY_NAME)}</p>`);
}

/* ---------- application notification template ---------- */

interface ApplicationNotificationData {
  name: string;
  email: string;
  role?: string;
  message?: string;
}

export function applicationNotificationHtml(data: ApplicationNotificationData): string {
  const rows = [
    fieldRow("Nome", data.name),
    fieldRow("Email", data.email),
    data.role ? fieldRow("Cargo de Interesse", data.role) : "",
    fieldRow("Data/Hora", new Date().toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })),
  ]
    .filter(Boolean)
    .join("");

  const messageHtml = data.message
    ? `<tr><td style="padding:8px 0;font-size:14px;color:#333;background:${BG_LIGHT};border-radius:4px;padding:12px">${escapeHtml(data.message).replace(/\n/g, "<br>")}</td></tr>`
    : "";

  return layoutHtml(`
    <h2 style="color:${NAVY};margin:0 0 16px;font-size:20px">Nova Candidatura Espontânea</h2>
    <p style="margin:0 0 20px;color:#555">Um candidato submeteu uma candidatura espontânea através do site.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%">
      <tr><td style="padding-bottom:4px"><h3 style="color:${NAVY};font-size:14px;margin:8px 0 0;border-bottom:1px solid #eee;padding-bottom:6px">Dados do Candidato</h3></td></tr>
      ${rows}
      ${
        data.message
          ? `<tr><td style="padding-bottom:4px"><h3 style="color:${NAVY};font-size:14px;margin:8px 0 0;border-bottom:1px solid #eee;padding-bottom:6px">Mensagem</h3></td></tr>
      ${messageHtml}`
          : ""
      }
    </table>`);
}

export function applicationConfirmationHtml(name: string): string {
  return layoutHtml(`
    <h2 style="color:${NAVY};margin:0 0 16px;font-size:20px">Recebemos a sua candidatura</h2>
    <p style="margin:0 0 16px">Olá <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px">Agradecemos o seu interesse em fazer parte da nossa equipa. Recebemos a sua candidatura e iremos analisá-la com atenção.</p>
    <p style="margin:0 0 16px">Se o seu perfil corresponder às nossas necessidades, entraremos em contacto consigo.</p>
    <p style="margin:0 0 4px">Atenciosamente,</p>
    <p style="margin:0;font-weight:700;color:${NAVY}">Equipa ${escapeHtml(COMPANY_NAME)}</p>`);
}
