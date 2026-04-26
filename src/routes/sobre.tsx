import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Eye, Sparkles, Award, Target, Users } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EXPANSION_COUNTRIES } from "@/lib/site";
import aboutTeam from "@/assets/about-team.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre Nós — Roseair Logistics" },
      {
        name: "description",
        content:
          "Conheça a Roseair Logistics: missão, visão e valores. Mais de uma década a transformar a logística em Moçambique.",
      },
      { property: "og:title", content: "Sobre Nós — Roseair Logistics" },
      { property: "og:description", content: "História, missão, visão e cobertura geográfica da Roseair Logistics." },
      { property: "og:image", content: aboutTeam },
    ],
  }),
  component: AboutPage,
});

const timeline = [
  { year: "2012", title: "Fundação", desc: "Início das operações em Maputo focado em desembaraço aduaneiro." },
  { year: "2016", title: "Expansão para Beira", desc: "Abertura de operação no maior corredor estratégico de trânsito internacional." },
  { year: "2019", title: "Logística Integrada", desc: "Lançamento do serviço door-to-door e novos parceiros internacionais." },
  { year: "2022", title: "Escritório na China", desc: "Presença internacional para apoiar importadores moçambicanos." },
  { year: "2024", title: "Expansão para Nacala & SADC", desc: "Cobertura SADC: Zimbabwe, Malawi, RDC, África do Sul, Eswatini, Zâmbia, Uganda, Burundi e Botswana." },
];

const values = [
  { Icon: Users, title: "Compromisso com o cliente", desc: "Priorizar as necessidades dos nossos clientes é o fundamento do nosso trabalho." },
  { Icon: Award, title: "Integridade", desc: "Operamos com transparência e ética em todas as nossas operações." },
  { Icon: Sparkles, title: "Excelência", desc: "Procuramos a melhoria contínua e a qualidade em todos os serviços prestados." },
  { Icon: Target, title: "Inovação", desc: "Investimos em tecnologia e processos para oferecer soluções modernas e eficientes." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        title="Construindo um Futuro mais Eficiente, Conectado e Sustentável"
        subtitle="Comprometidos com a transformação e inovação no mercado logístico de Moçambique."
        image={aboutTeam}
        breadcrumb={<span><Link to="/" className="hover:text-white">Início</Link> / Sobre</span>}
      />

      {/* CEO Message */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Mensagem do CEO</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">
                Inovação ao serviço de Moçambique
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Caros parceiros e clientes,
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                É com grande entusiasmo que vos apresento a Roseair Logistics, uma empresa comprometida com a transformação e inovação no mercado logístico de Moçambique. Refletindo sobre o panorama actual e as oportunidades futuras, estou profundamente optimista quanto ao papel vital que desempenhamos no desenvolvimento económico e industrial da nossa nação.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Moçambique, com a sua localização estratégica na costa sudeste de África, possui um imenso potencial logístico. Os nossos portos, ferrovias e estradas são condutas cruciais que ligam o interior do continente aos mercados globais.
              </p>
            </div>
            <div>
              <p className="mt-12 text-muted-foreground leading-relaxed">
                Na Roseair Logistics, acreditamos que a inovação é a chave para desbloquear o futuro. Estamos na vanguarda da implementação de tecnologias de ponta que redefinem a forma como operamos — desde sistemas avançados de gestão de armazém (WMS) até soluções de rastreamento em tempo real e automação de processos.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                A nossa visão é clara: <strong className="text-secondary">ser o principal fornecedor de soluções logísticas em Moçambique</strong>, impulsionando o crescimento e a competitividade dos nossos clientes. Convidamos-vos a juntar-se a nós nesta jornada de inovação e crescimento.
              </p>
              <p className="mt-5 text-secondary font-semibold italic">— Roseair Logistics, SA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl container-px py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-secondary text-white border-0 shadow-card-hover">
              <CardContent className="p-8">
                <Eye className="h-8 w-8 text-primary" />
                <h3 className="mt-3 text-2xl font-extrabold">Visão</h3>
                <p className="mt-3 text-white/85 leading-relaxed">
                  Ser a escolha de referência em desembaraço aduaneiro e soluções logísticas na região, reconhecida pela inovação, excelência de serviço e sustentabilidade.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-0 shadow-card-hover">
              <CardContent className="p-8">
                <Heart className="h-8 w-8" />
                <h3 className="mt-3 text-2xl font-extrabold">Missão</h3>
                <p className="mt-3 text-white/90 leading-relaxed">
                  Oferecer serviços de logística e transporte que excedam as expectativas dos nossos clientes, garantindo a entrega segura e atempada das suas mercadorias.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="mt-14 text-2xl md:text-3xl font-extrabold text-secondary text-center">Os Nossos Valores</h3>
          <div className="mx-auto mt-3 h-1 w-16 bg-primary rounded-full" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <Card key={v.title} className="bg-white shadow-card hover:shadow-card-hover transition">
                <CardContent className="p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <v.Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 font-bold text-secondary">{v.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-background">
        <div className="mx-auto max-w-4xl container-px py-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-secondary text-center tracking-tight">A Nossa Trajetória</h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-primary rounded-full" />
          <div className="mt-12 relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
            {timeline.map((t, i) => (
              <div key={t.year} className={`relative mb-8 md:mb-12 md:grid md:grid-cols-2 md:gap-8 ${i % 2 === 0 ? "" : "md:[direction:rtl]"}`}>
                <div className={`pl-12 md:pl-0 md:[direction:ltr] ${i % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8"}`}>
                  <div className="text-sm font-bold text-primary uppercase tracking-wider">{t.year}</div>
                  <h3 className="mt-1 text-xl font-bold text-secondary">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                </div>
                <div className="hidden md:block" />
                <div className="absolute left-4 md:left-1/2 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background -translate-x-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-secondary text-white">
        <div className="mx-auto max-w-7xl container-px py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Cobertura Geográfica</h2>
              <p className="mt-4 text-white/80">
                Operamos em Moçambique (Maputo, Beira, Nacala) e expandimos a nossa agenda 2024–2025 para apoiar toda a região SADC com soluções e expertise.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold">Moçambique (sede)</span>
                {EXPANSION_COUNTRIES.map((c) => (
                  <span key={c} className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm">{c}</span>
                ))}
              </div>
              <Button asChild size="lg" className="mt-7 rounded-full bg-white text-primary hover:bg-white/90">
                <Link to="/contacto">Contactar a Nossa Equipa</Link>
              </Button>
            </div>
            <div className="rounded-2xl bg-white/5 p-8 border border-white/10 backdrop-blur">
              {/* Stylized SVG of Africa */}
              <svg viewBox="0 0 400 400" className="w-full h-auto" aria-label="Mapa de África">
                <path
                  d="M180 60 Q220 50 260 70 Q290 100 295 140 Q310 170 300 210 Q310 250 280 290 Q260 330 220 350 Q190 365 160 350 Q130 330 115 295 Q100 260 105 220 Q95 180 110 140 Q130 95 180 60 Z"
                  fill="oklch(0.4 0.05 265)"
                  stroke="oklch(0.7 0.05 265)"
                  strokeWidth="1.5"
                />
                {/* Mozambique highlight */}
                <ellipse cx="240" cy="240" rx="22" ry="55" fill="oklch(0.55 0.21 27)" transform="rotate(-15 240 240)" />
                <circle cx="240" cy="200" r="6" fill="white" />
                <text x="252" y="205" fill="white" fontSize="13" fontWeight="700">Maputo</text>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
