import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronDown, Ship, Plane, Truck, Boxes, FileCheck2, Shield,
  Clock, Globe2, HeadphonesIcon, BadgeDollarSign, Calculator, Quote, Star,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Counter } from "@/components/Counter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import { CLIENTS, SITE } from "@/lib/site";
import heroPort from "@/assets/hero-port.jpg";
import warehouseTeam from "@/assets/warehouse-team.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roseair Logistics — Logística que Liga Moçambique ao Mundo" },
      {
        name: "description",
        content:
          "Soluções completas de transporte, importação, exportação e desembaraço aduaneiro em Moçambique. Mais de 12 anos a ligar Moçambique ao mundo.",
      },
      { property: "og:title", content: "Roseair Logistics — Logística que Liga Moçambique ao Mundo" },
      {
        property: "og:description",
        content:
          "Transporte marítimo, aéreo e terrestre + desembaraço aduaneiro. Cobertura SADC. Peça a sua cotação.",
      },
      { property: "og:image", content: heroPort },
      { name: "twitter:image", content: heroPort },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: SITE.name,
          image: heroPort,
          telephone: SITE.phones[0],
          email: SITE.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Olof Palme, nº 798, 2º andar / direito",
            addressLocality: "Maputo",
            addressCountry: "MZ",
          },
          areaServed: "Mozambique, SADC",
          slogan: SITE.tagline,
        }),
      },
    ],
  }),
  component: HomePage,
});

const services = [
  {
    icon: FileCheck2,
    title: "Desembaraço Aduaneiro",
    desc: "Processos completos em todos os terminais rodoviários, marítimos, aéreos e postais nacionais.",
  },
  {
    icon: Truck,
    title: "Transporte de Mercadorias",
    desc: "Cobertura nacional e regional SADC com parceiros estratégicos selecionados.",
  },
  {
    icon: Boxes,
    title: "Importação & Exportação",
    desc: "Gestão integrada de regimes aduaneiros, trânsito e consultoria especializada.",
  },
  {
    icon: Shield,
    title: "Soluções Personalizadas",
    desc: "Projetos à medida para grandes volumes, indústria, mineração e construção.",
  },
];

const differentials = [
  { Icon: Clock, label: "Rapidez nas entregas" },
  { Icon: Boxes, label: "Equipa especializada" },
  { Icon: Globe2, label: "Cobertura internacional" },
  { Icon: FileCheck2, label: "Documentação sem erros" },
  { Icon: HeadphonesIcon, label: "Suporte dedicado 24/7" },
  { Icon: BadgeDollarSign, label: "Preços competitivos" },
];

const testimonials = [
  {
    name: "Eng. Carlos Mondlane",
    role: "Director de Operações, Brisa e Sol",
    quote:
      "Mais de 600 contentores geridos com confiança e profissionalismo. A Roseair é um parceiro essencial do nosso projecto na Costa do Sol.",
  },
  {
    name: "Li Wei",
    role: "General Manager, Haiyu Mining",
    quote:
      "Excelente capacidade de resposta e conhecimento profundo das rotas regionais. Recomendamos sem reservas.",
  },
  {
    name: "Anita Pereira",
    role: "Logística, Macsteel Mozambique",
    quote:
      "Documentação aduaneira impecável e prazos sempre cumpridos. A diferença está na qualidade do acompanhamento.",
  },
  {
    name: "João Sitoe",
    role: "Procurement, China Henan International",
    quote:
      "Equipa proactiva, comunicação clara e custos competitivos. Trabalhamos com a Roseair há vários anos com total satisfação.",
  },
];

function HomePage() {
  return (
    <SiteLayout transparentNav>
      {/* HERO */}
      <section
        className="relative min-h-[92vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(135deg, oklch(0.15 0.05 265 / 0.78), oklch(0.27 0.09 265 / 0.62)), url(${heroPort})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-7xl container-px py-32 md:py-40 text-white relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border border-white/20">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {SITE.tagline}
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Logística que Liga<br />
              <span className="text-primary">Moçambique</span> ao Mundo
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              Soluções completas de transporte, importação, exportação e desembaraço aduaneiro — com rapidez e confiabilidade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7 h-12 font-semibold shadow-card-hover">
                <Link to="/simulador">
                  Pedir Cotação <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 font-semibold bg-transparent text-white border-white/60 hover:bg-white hover:text-secondary"
              >
                <Link to="/servicos">Conhecer os Serviços</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <a
          href="#stats"
          aria-label="Descer"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 animate-bounce"
        >
          <ChevronDown className="h-7 w-7" />
        </a>
      </section>

      {/* STATS */}
      <section id="stats" className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl container-px py-12 grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 divide-y md:divide-y-0 md:divide-x divide-white/15">
          {[
            { n: 500, suffix: "+", label: "Clientes Satisfeitos" },
            { n: 12, suffix: " Anos", label: "de Experiência" },
            { n: 30, suffix: "+", label: "Países Conectados" },
            { n: 98, suffix: "%", label: "Taxa de Pontualidade" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-4 md:py-2 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-white">
                <Counter to={s.n} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm text-white/75">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">Os Nossos Serviços</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-primary rounded-full" />
            <p className="mt-4 text-muted-foreground">
              Cobertura completa do fluxo logístico — do fornecedor ao cliente final, com a política door-to-door.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group h-full border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <span className="absolute inset-x-0 top-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  <CardContent className="p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-secondary">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    <Link
                      to="/servicos"
                      className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:gap-2 transition-all gap-1"
                    >
                      Saber mais <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl container-px py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative">
            <img
              src={warehouseTeam}
              alt="Equipa Roseair Logistics em armazém"
              loading="lazy"
              width={1280}
              height={960}
              className="rounded-2xl shadow-card-hover object-cover w-full aspect-[4/3]"
            />
            <div className="hidden md:block absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-xl p-5 shadow-card-hover max-w-[220px]">
              <div className="text-3xl font-extrabold">600+</div>
              <div className="text-xs opacity-90 mt-1">Contentores geridos para o projecto Brisa e Sol</div>
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Porquê escolher-nos</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">
              Comprometidos com a excelência em cada operação
            </h2>
            <p className="mt-4 text-muted-foreground">
              Equipa dedicada de profissionais que trabalham incansavelmente para que cada operação seja executada com a máxima eficiência e cuidado.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {differentials.map((d) => (
                <li key={d.label} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <d.Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-secondary">{d.label}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-7 rounded-full px-6">
              <Link to="/servicos">Ver Todos os Serviços <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SIMULATOR PREVIEW */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-16">
          <div className="rounded-2xl bg-[var(--color-surface)] border-l-4 border-primary p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] items-center gap-6 shadow-card">
            <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Calculator className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-secondary">Simule o Custo do Seu Transporte</h2>
              <p className="mt-2 text-muted-foreground">Obtenha uma estimativa em segundos — sem compromisso.</p>
            </div>
            <Button asChild size="lg" className="rounded-full px-7 h-12">
              <Link to="/simulador">Ir para o Simulador <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl container-px py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">Clientes que Confiam na Nossa Marca</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-primary rounded-full" />
          </div>
          <Carousel opts={{ loop: true, align: "start" }} className="mt-10">
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full bg-white shadow-card">
                    <CardContent className="p-6 flex flex-col h-full">
                      <Quote className="h-8 w-8 text-primary/30" />
                      <p className="mt-3 text-sm text-foreground/80 leading-relaxed flex-1">"{t.quote}"</p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                          {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-secondary">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.role}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* PARTNERS MARQUEE */}
      <section className="bg-background border-y border-border">
        <div className="mx-auto max-w-7xl container-px py-12">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Os Nossos Parceiros & Clientes
          </h3>
          <div className="mt-8 overflow-hidden">
            <div className="flex animate-marquee gap-12 whitespace-nowrap">
              {[...CLIENTS, ...CLIENTS].map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="text-base md:text-lg font-bold text-muted-foreground/60 hover:text-primary transition-colors shrink-0"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-cta text-white">
        <div className="mx-auto max-w-5xl container-px py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Pronto para Enviar a Sua Carga?</h2>
          <p className="mt-4 text-lg text-white/85 max-w-2xl mx-auto">
            Fale connosco hoje e receba uma proposta personalizada para a sua operação.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-7 h-12 bg-white text-primary hover:bg-white/90 font-semibold">
              <Link to="/simulador">Pedir Cotação Agora <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 bg-transparent border-white/60 text-white hover:bg-white/10">
              <Link to="/contacto">Falar com a Equipa</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
