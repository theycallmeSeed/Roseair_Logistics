// Centralized company data (sourced from Roseair Logistics Company Profile 2024-2025)

export const SITE = {
  name: "ROSEAIR LOGISTICS, SA",
  shortName: "Roseair Logistics",
  tagline: "Connecting Mozambique to the World",
  taglinePT: "Logística que Liga Moçambique ao Mundo",
  address: "Av. Olof Palme, nº 798, 2º andar / direito, Maputo, Moçambique",
  phones: ["+258 86 352 7562", "+258 87 70 40 453"],
  whatsapp: "258863527562",
  email: "roseair.geral@outlook.com",
  emailCommercial: "comercial@roseair.co.mz",
  hours: "Seg–Sex · 08:00 – 17:00",
  social: {
    linkedin: "https://www.linkedin.com",
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com",
  },
  whatsappUrl(message = "Olá! Gostaria de pedir uma cotação à Roseair Logistics.") {
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(message)}`;
  },
} as const;

export const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/simulador", label: "Simulador" },
  { to: "/sobre", label: "Sobre" },
  { to: "/projectos", label: "Projectos" },
  { to: "/equipa", label: "Equipa" },
  { to: "/contacto", label: "Contacto" },
] as const;

export const CLIENTS = [
  "Brisa e Sol",
  "Mozambique Heavysand Company Lda",
  "Africa Great Wall",
  "Haiyu (Mozambique) Mining Co., Lda",
  "Sunlight",
  "Praia Shopping",
  "China Henan International Corp",
  "Macsteel Mozambique",
  "Watt Trade",
];

export const EXPANSION_COUNTRIES = [
  "Zimbabwe", "Malawi", "Congo (RDC)", "África do Sul",
  "Eswatini", "Zâmbia", "Uganda", "Burundi", "Botswana",
];
