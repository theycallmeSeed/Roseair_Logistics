# ROSEAIR LOGISTICS, SA — Website Plan

A professional, conversion-oriented multi-page website for Roseair Logistics (Soupse Logistics), a Mozambican logistics, customs clearance and freight forwarding company. All copy is grounded in the official Company Profile PDF you uploaded (CEO message, mission/vision/values, services, real client list, Brisa e Sol case study, real contacts).

---

## Brand & Design System

- **Logo:** "ROSEAIR" red (#CC1C1C) + "LOGISTICS, SA" navy (#1A2B5C) with a minimalist plane/globe SVG icon
- **Palette:** Red #CC1C1C · Navy #1A2B5C · Light grey #F5F5F5 · White
- **Typography:** Inter (400/500/600/700/800) via Google Fonts, preloaded
- **Tagline:** "Connecting Mozambique to the World"
- **Tone:** Formal but accessible, solution-focused, emphasis on speed and reliability
- Tailwind v4 design tokens registered in `src/styles.css` (semantic variables for primary/navy/red/surface)

## Global Components

- **Sticky Navbar** — transparent over hero, white + soft shadow on scroll. Logo left · links centre (Início · Serviços · Simulador · Sobre · Projectos · Equipa · Contacto) · PT/EN toggle + red "Pedir Cotação" CTA right. Mobile hamburger drawer with animation.
- **Footer** — navy background, 4 columns (Logo+tagline · Quick links · Services · Contact with real address/phones/email), social icons, copyright + privacy/terms.
- **Floating WhatsApp button** — bottom-right, pulsing, links to wa.me with prefilled message.
- **Cookies banner** — "Aceitar todos / Gerir preferências".
- **404 + global error boundary** with branded styling.
- Scroll-to-top on route change, smooth route transitions.

## Page Structure (TanStack Start routes)

```text
/                  Home
/servicos          Services
/simulador         Quote Simulator (3-step wizard)
/sobre             About
/projectos         Projects / Case studies
/equipa            Team
/contacto          Contact
```

Each route has its own `head()` metadata (title, description, og:title, og:description, og:image where relevant) for SEO/social sharing.

### 1 — Home (`/`)
- **Hero** with port/cargo background + navy 70% overlay. H1 "Logística que Liga Moçambique ao Mundo", subtitle, two CTAs (Pedir Cotação / Conhecer Serviços), animated scroll indicator.
- **Stats bar** (navy): 500+ Clientes · 12 Anos · 30+ Países · 98% Pontualidade — animated counters on viewport enter.
- **Featured Services** — 4 cards (Desembaraço Aduaneiro · Transporte · Importação & Exportação · Soluções Personalizadas) using shadcn Card.
- **Why Choose Us** — two-column with image + checklist (Rapidez, Equipa especializada, Cobertura internacional, Documentação sem erros, Suporte, Preços competitivos).
- **Quote Simulator preview** — light-grey block with red left border, CTA to `/simulador`.
- **Testimonials carousel** — 4 cards with names from real client list (Brisa e Sol, Macsteel Mozambique, Haiyu Mining, China Henan), 5-star rating, shadcn Carousel with auto-play.
- **Partners marquee** — infinite horizontal scroll of client names from PDF (greyscale → colour on hover).
- **Final CTA** — diagonal navy→red gradient, "Pronto para Enviar a Sua Carga?" + button.

### 2 — Services (`/servicos`)
- Inner hero + breadcrumb.
- Intro text adapted from the CEO message and "Who Are We?".
- **6 detailed service cards** based on the PDF:
  1. Desembaraço Aduaneiro (Customs Brokerage — all road/sea/air/postal terminals)
  2. Transporte Marítimo (FCL/LCL, Maputo/Beira/Nacala corridors)
  3. Transporte Aéreo (new air-cargo partnership messaging)
  4. Transporte Terrestre / Rodoviário (SADC corridor, strategic partners)
  5. Importação & Exportação (regimes aduaneiros)
  6. Logística Integrada / Armazenagem (door-to-door, 24/7 monitored bonded warehousing)
- Each: large icon, description, benefit bullets, "Pedir Cotação para este Serviço" button.
- **FAQ accordion** (shadcn Accordion).
- Quick contact form CTA at bottom.

### 3 — Quote Simulator (`/simulador`)
- Page title, subtitle, prominent **legal disclaimer** in soft yellow box.
- **3-step wizard with progress bar and slide transitions:**
  - Step 1 — Tipo de Serviço: clickable cards (Marítimo · Aéreo · Terrestre · Multimodal)
  - Step 2 — Detalhes da Carga: import/export/transit radios, origem/destino, peso (input + slider), volume, tipo de mercadoria, valor declarado, urgência
  - Step 3 — Resultado: navy result card showing Frete + Seguro (1.5%) + Desembaraço ($350) + Total
- **Calculation logic** exactly per brief (sea/air/road formulas × urgency multiplier 1 / 1.4 / 1.9).
- "Receber Proposta Real por Email" opens modal with name/email/phone/company; "Refazer Simulação" resets.
- React Hook Form + Zod validation, inline errors, mobile-friendly vertical steps.

### 4 — About (`/sobre`)
- Hero with team/office photo + overlay.
- **Full CEO message** from the PDF (Message from the CEO of Roseair Logistics) in two columns.
- "Who Are We?" section.
- **Mission · Vision · Values** — 3 icon cards with the exact PDF copy (Customer Commitment, Integrity, Excellence, Innovation).
- **Animated timeline** 2012 → present including office expansion to China and openings in Maputo, Beira, Nacala.
- Certifications/licences placeholder block.
- Geographic coverage — SVG map of Africa highlighting Mozambique and the 2024–2025 expansion countries from the PDF (Zimbabwe, Malawi, DRC, South Africa, Eswatini, Zambia, Uganda, Burundi, Botswana).
- CTA to Contact.

### 5 — Projects (`/projectos`)
- Grid of 6 case-study cards with category badges and filters (Marítimo · Aéreo · Terrestre · Desembaraço).
- Featured case: **Brisa e Sol — A Giant Project, A Solid Partnership** (2+ years, 600+ containers handled, Av. Marginal Costa do Sol Maputo) — full text from PDF.
- Other cards seeded with the real clients listed in the PDF (Mozambique Heavysand, Africa Great Wall, Haiyu Mining, Macsteel Mozambique, China Henan, Watt Trade, Sunlight, Praia Shopping).
- Hover overlay → "Ver Detalhes" opens shadcn Dialog modal (no route change).
- Final CTA: "Torne-se o Nosso Próximo Caso de Sucesso".

### 6 — Team (`/equipa`)
- Grid of member cards built from the 9 roles in the PDF (Logistics Operations Manager, Logistics Analyst, Customs Broker, Transportation Coordinator, Import/Export Specialist, Compliance Analyst, Logistics Assistant, Demand Planning Analyst, Logistics IT Specialist) with realistic Mozambican names, role, short bio derived from PDF duties, LinkedIn/email icons.
- Hover elevation + bio reveal.
- "Junte-se a Nós" section → modal with spontaneous application form.

### 7 — Contact (`/contacto`)
- Two columns:
  - Left: full validated form (Nome, Email, Telefone/WhatsApp, Empresa, Tipo de serviço, Mensagem, privacy checkbox, red full-width submit, success/error toast).
  - Right: real contact info from the PDF
    - Av. Olof Palme nº 798, 2º andar / direito, Maputo, Moçambique
    - +258 86 352 7562 · +258 87 70 40 453
    - roseair.geral@outlook.com
    - Horário de funcionamento
    - Green WhatsApp button
- Embedded Google Map (Av. Olof Palme, Maputo) full-width below.
- Social links (LinkedIn, Facebook, Instagram).

## Technical Notes

- **Stack:** TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + shadcn/ui + Framer Motion + React Hook Form + Zod + Radix Icons.
- **Note:** Brief mentioned React Router DOM — TanStack Router is the project standard and provides the same outcomes (typed `<Link>`, route-level meta, scroll restoration), so we'll use it instead of adding a second router.
- File-based routes under `src/routes/`; each route exports its own `head()`.
- Reusable components in `src/components/` (Navbar, Footer, WhatsAppFAB, CookieBanner, ServiceCard, StatCounter, TestimonialCarousel, PartnerMarquee, SimulatorWizard, etc.).
- Inter font preloaded; images lazy-loaded; semantic OG/Twitter meta per route; JSON-LD `LocalBusiness` schema on home and contact.
- PT as default language with EN toggle scaffolding (i18n-ready dictionary, full EN translation can follow later if desired).
- Hero/section background images sourced from royalty-free logistics imagery and stored in `src/assets/`.
- Mobile-first responsive, 48px tap targets, no inputs <16px on mobile.

## Out of Scope (initial build)

- Real backend for the contact form / simulator email (will use a toast confirmation; can wire to Lovable Cloud later).
- Full EN translation strings (toggle UI ready, copy can be added in a follow-up).
- Real partner logos (placeholder text logos until you provide assets).
