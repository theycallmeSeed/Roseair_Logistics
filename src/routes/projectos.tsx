import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import projectImg from "@/assets/project-brisaesol.jpg";
import warehouse from "@/assets/warehouse-team.jpg";
import services from "@/assets/services-banner.jpg";
import port from "@/assets/hero-port.jpg";

export const Route = createFileRoute("/projectos")({
  head: () => ({
    meta: [
      { title: "Projectos & Casos de Sucesso — Roseair Logistics" },
      {
        name: "description",
        content:
          "Conheça os projectos da Roseair Logistics: Brisa e Sol, mineração, retalho e indústria — mais de 600 contentores geridos.",
      },
      { property: "og:title", content: "Projectos & Casos de Sucesso — Roseair Logistics" },
      { property: "og:description", content: "Casos reais: Brisa e Sol, Heavysand, Macsteel, Haiyu Mining e mais." },
      { property: "og:image", content: projectImg },
    ],
  }),
  component: ProjectsPage,
});

type Category = "Marítimo" | "Aéreo" | "Terrestre" | "Desembaraço";

const projects: {
  id: string; title: string; client: string; category: Category; image: string;
  short: string; result: string; full: string;
}[] = [
  {
    id: "brisaesol",
    title: "Brisa e Sol — Costa do Sol",
    client: "Brisa e Sol",
    category: "Marítimo",
    image: projectImg,
    short: "Importação contínua de materiais de construção para um dos maiores investimentos do sector automóvel e turismo em Moçambique.",
    result: "+600 contentores geridos em mais de 2 anos",
    full:
      "A Roseair Logistics tem o orgulho de fazer parte de um dos maiores projectos de investimento no sector automóvel e turismo em Moçambique, liderado pela Brisa e Sol. Este desenvolvimento marcante irá transformar a Av. Marginal, Costa do Sol – Maputo, com espaços para hotelaria, restauração, condomínios, lazer e entretenimento. A nossa contribuição tem sido essencial desde o início: há mais de 2 anos apoiamos a importação de materiais de construção, tendo já gerido mais de 600 contentores, garantindo confiança, rapidez e profissionalismo em cada etapa.",
  },
  {
    id: "heavysand",
    title: "Mozambique Heavysand — Cargas Mineiras",
    client: "Mozambique Heavysand Company Lda",
    category: "Marítimo",
    image: port,
    short: "Operações marítimas regulares para exportação de areias pesadas e equipamento mineiro.",
    result: "Operações trimestrais sem incidentes",
    full:
      "Apoio integrado em operações marítimas FCL para a Mozambique Heavysand, gerindo desembaraço, transporte portuário e documentação aduaneira em ciclos trimestrais.",
  },
  {
    id: "haiyu",
    title: "Haiyu Mining — Logística Mineira",
    client: "Haiyu (Mozambique) Mining Co., Lda",
    category: "Terrestre",
    image: warehouse,
    short: "Transporte rodoviário pesado e logística integrada para operações mineiras.",
    result: "Cobertura SADC operacional",
    full:
      "Coordenação de transporte rodoviário com parceiros estratégicos para a Haiyu Mining, suportando trânsito SADC e armazenagem alfandegada para equipamento e consumíveis críticos.",
  },
  {
    id: "macsteel",
    title: "Macsteel Mozambique — Aço Industrial",
    client: "Macsteel Mozambique",
    category: "Desembaraço",
    image: services,
    short: "Desembaraço aduaneiro de produtos siderúrgicos com prazos críticos.",
    result: "Tempo médio de desembaraço reduzido em 35%",
    full:
      "A Roseair gere o desembaraço aduaneiro recorrente da Macsteel Mozambique para produtos siderúrgicos importados, com SLA específicos de prazo e zero não-conformidades documentais.",
  },
  {
    id: "chinahenan",
    title: "China Henan — Importação Industrial",
    client: "China Henan International Corp",
    category: "Marítimo",
    image: port,
    short: "Importação contínua de equipamento industrial via portos de Maputo e Beira.",
    result: "Operações multimodais Maputo–Beira",
    full:
      "Apoio à China Henan na importação de equipamento industrial e contentores de projecto, com gestão integrada de marítimo, terrestre e desembaraço.",
  },
  {
    id: "watt",
    title: "Watt Trade — Distribuição Regional",
    client: "Watt Trade",
    category: "Aéreo",
    image: services,
    short: "Soluções aéreas urgentes para reposição de stock crítico.",
    result: "Lead times reduzidos para 5 dias",
    full:
      "Operação aérea com parceiros internacionais para a Watt Trade, garantindo reposição rápida de stock crítico e SLA de 5 dias porta-a-porta.",
  },
];

const categories: ("Todos" | Category)[] = ["Todos", "Marítimo", "Aéreo", "Terrestre", "Desembaraço"];

function ProjectsPage() {
  const [filter, setFilter] = useState<"Todos" | Category>("Todos");
  const [active, setActive] = useState<typeof projects[number] | null>(null);

  const list = useMemo(
    () => (filter === "Todos" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <SiteLayout>
      <PageHero
        title="Casos de Sucesso & Projectos"
        subtitle="Operações reais que sustentam o crescimento dos nossos clientes em Moçambique e na região."
        image={projectImg}
        breadcrumb={<span><Link to="/" className="hover:text-white">Início</Link> / Projectos</span>}
      />

      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-14">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  filter === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-secondary hover:bg-secondary hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card
                  className="group overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all cursor-pointer h-full"
                  onClick={() => setActive(p)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold">
                        Ver Detalhes <ArrowRight className="inline ml-1 h-4 w-4" />
                      </span>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">
                      {p.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {p.client}
                    </div>
                    <h3 className="mt-1.5 font-bold text-secondary">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.short}</p>
                    <p className="mt-3 text-xs font-semibold text-primary uppercase tracking-wider">
                      ✓ {p.result}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-cta text-white">
        <div className="mx-auto max-w-4xl container-px py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Torne-se o Nosso Próximo Caso de Sucesso</h2>
          <Button asChild size="lg" className="mt-6 rounded-full bg-white text-primary hover:bg-white/90">
            <Link to="/contacto">Iniciar Conversa</Link>
          </Button>
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <Badge className="w-fit bg-primary text-primary-foreground border-0">{active.category}</Badge>
                <DialogTitle className="text-2xl">{active.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Cliente: <strong>{active.client}</strong>
                </DialogDescription>
              </DialogHeader>
              <img src={active.image} alt={active.title} className="rounded-lg w-full aspect-[16/9] object-cover" />
              <p className="text-sm leading-relaxed text-foreground/80">{active.full}</p>
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-4 text-sm">
                <strong className="text-primary">Resultado: </strong>{active.result}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
