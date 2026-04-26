import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileCheck2, Ship, Plane, Truck, Globe2, Warehouse, ArrowRight, Check,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import servicesBanner from "@/assets/services-banner.jpg";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Roseair Logistics" },
      {
        name: "description",
        content:
          "Desembaraço aduaneiro, transporte marítimo, aéreo, terrestre, importação, exportação e logística integrada em Moçambique e SADC.",
      },
      { property: "og:title", content: "Serviços — Roseair Logistics" },
      {
        property: "og:description",
        content: "Soluções logísticas completas: aduaneiro, marítimo, aéreo, terrestre, importação/exportação e armazenagem.",
      },
      { property: "og:image", content: servicesBanner },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: FileCheck2,
    title: "Desembaraço Aduaneiro",
    desc: "A Roseair Logistics oferece serviços completos de desembaraço aduaneiro, cobrindo todos os terminais rodoviários, marítimos, aéreos e postais a nível nacional.",
    benefits: [
      "Equipa altamente qualificada de despachantes oficiais",
      "Processos rápidos com mínimo de atrasos",
      "Redução de custos adicionais",
      "Conformidade com regulamentação aduaneira e fiscal",
    ],
  },
  {
    icon: Ship,
    title: "Transporte Marítimo",
    desc: "Soluções FCL e LCL através dos principais portos de Moçambique — Maputo, Beira (o maior corredor estratégico de trânsito internacional) e Nacala.",
    benefits: [
      "Cobertura dos portos de Maputo, Beira e Nacala",
      "Containers FCL e LCL",
      "Trânsito para o interior da SADC",
      "Acompanhamento em tempo real",
    ],
  },
  {
    icon: Plane,
    title: "Transporte Aéreo",
    desc: "Expansão dos serviços de transporte aéreo de carga através de uma nova parceria estratégica, oferecendo soluções rápidas e seguras com eficiência inigualável.",
    benefits: [
      "Resposta a necessidades urgentes",
      "Cobertura de rotas internacionais",
      "Cargas de alto valor com segurança reforçada",
      "Documentação aérea completa",
    ],
  },
  {
    icon: Truck,
    title: "Transporte Terrestre",
    desc: "Parcerias estratégicas com transportadoras de elevada reputação para transporte rodoviário nacional e internacional na região SADC.",
    benefits: [
      "Cobertura nacional e SADC",
      "Parceiros cuidadosamente selecionados",
      "Pontualidade e segurança",
      "Trânsito de fronteira simplificado",
    ],
  },
  {
    icon: Globe2,
    title: "Importação & Exportação",
    desc: "Gestão integrada de processos de importação e exportação, com conhecimento profundo de regimes aduaneiros e consultoria especializada em comércio internacional.",
    benefits: [
      "Atualização permanente em políticas internacionais",
      "Coordenação multi-equipa",
      "Otimização de regimes aduaneiros",
      "Consultoria estratégica",
    ],
  },
  {
    icon: Warehouse,
    title: "Logística Integrada & Armazenagem",
    desc: "Política door-to-door cobrindo todo o fluxo desde o fornecedor ao cliente final, com armazéns alfandegados monitorados 24/7 com tecnologia de ponta.",
    benefits: [
      "Política door-to-door",
      "Armazéns alfandegados monitorados 24/7",
      "Escritórios em Maputo, Beira, Nacala e China",
      "Tecnologia de ponta para integridade dos produtos",
    ],
  },
];

const faqs = [
  {
    q: "Quanto tempo demora o processo de desembaraço aduaneiro?",
    a: "Depende do tipo de mercadoria, regime aduaneiro e completude da documentação. Em condições normais, processos simples são concluídos em 2 a 5 dias úteis. A nossa equipa trabalha proativamente para minimizar prazos.",
  },
  {
    q: "Trabalham com quais portos e fronteiras em Moçambique?",
    a: "Operamos nos portos de Maputo, Beira (o maior corredor estratégico de trânsito internacional) e Nacala — com expansão prevista. Apoiamos também desembaraços em todos os terminais rodoviários, aéreos e postais nacionais.",
  },
  {
    q: "Cobrem trânsito para a região SADC?",
    a: "Sim. A nossa agenda 2024–2025 inclui suporte a Zimbabwe, Malawi, Congo, África do Sul, Eswatini, Zâmbia, Uganda, Burundi e Botswana, com parceiros rodoviários selecionados.",
  },
  {
    q: "Como solicito uma cotação?",
    a: "Pode usar o nosso simulador online para obter uma estimativa em segundos, ou contactar a equipa comercial directamente via WhatsApp, telefone ou email para uma proposta personalizada.",
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero
        title="Os Nossos Serviços"
        subtitle="Soluções integradas para importação, exportação, trânsito e logística — no país e na região."
        image={servicesBanner}
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-white">Início</Link> / Serviços
          </span>
        }
      />

      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
              Quem Somos
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A Roseair Logistics é uma empresa que integra trânsito, fretes marítimos, gestão de desembaraço aduaneiro de mercadorias em vários regimes — incluindo importação, exportação e trânsito. Com anos de experiência no sector, somos reconhecidos pela fiabilidade, rapidez e compromisso com a satisfação dos clientes.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <Card key={s.title} className="border border-border shadow-card hover:shadow-card-hover transition-all">
                <CardContent className="p-7">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary">{s.title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="mt-6 rounded-full">
                    <Link to="/simulador">Pedir Cotação para este Serviço <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl container-px py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">Perguntas Frequentes</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-primary rounded-full" />
          </div>
          <Accordion type="single" collapsible className="mt-8 bg-white rounded-xl shadow-card p-2 md:p-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-semibold text-secondary px-4">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-cta text-white">
        <div className="mx-auto max-w-5xl container-px py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Vamos discutir o seu próximo envio</h2>
          <p className="mt-3 text-white/85">A nossa equipa responde em menos de 24 horas.</p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-7 h-12 bg-white text-primary hover:bg-white/90">
              <Link to="/simulador">Pedir Cotação</Link>
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
