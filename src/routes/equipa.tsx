import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLeadSubmit } from "@/lib/leads";
import { FormSuccess } from "@/components/FormSuccess";
import aboutTeam from "@/assets/about-team.webp";

export const Route = createFileRoute("/equipa")({
  head: () => ({
    meta: [
      { title: "A Nossa Equipa — Roseair Logistics" },
      {
        name: "description",
        content:
          "Conheça a equipa multidisciplinar da Roseair Logistics: gestão de operações, despacho aduaneiro, importação/exportação, compliance e TI logística.",
      },
      { property: "og:title", content: "A Nossa Equipa — Roseair Logistics" },
      {
        property: "og:description",
        content: "Profissionais dedicados que sustentam cada operação.",
      },
      { property: "og:image", content: aboutTeam },
    ],
  }),
  component: TeamPage,
});

const team = [
  {
    name: "Augusto Macuácua",
    role: "Logistics Operations Manager",
    bio: "Coordena todas as actividades logísticas, da recepção à entrega, gerindo equipas e otimizando processos.",
  },
  {
    name: "Beatriz Cossa",
    role: "Logistics Analyst",
    bio: "Monitoriza o fluxo de mercadorias e analisa dados para identificar problemas e propor soluções.",
  },
  {
    name: "Carlos Fernandes",
    role: "Customs Broker",
    bio: "Prepara e verifica documentos de importação e exportação, garantindo conformidade fiscal.",
  },
  {
    name: "Dário Manhiça",
    role: "Transportation Coordinator",
    bio: "Planeia rotas de transporte, negoceia condições com transportadoras e supervisiona cargas.",
  },
  {
    name: "Elsa Tembe",
    role: "Import & Export Specialist",
    bio: "Gere processos de importação/exportação e mantém-se actualizada em políticas internacionais.",
  },
  {
    name: "Fernando Bila",
    role: "Compliance Analyst",
    bio: "Monitoriza conformidade legal e regulamentar, conduz auditorias internas e implementa políticas.",
  },
  {
    name: "Gracinda Mabunda",
    role: "Logistics Assistant",
    bio: "Suporta a gestão de operações e mantém actualizados os sistemas de gestão logística.",
  },
  {
    name: "Hélio Sumbane",
    role: "Demand Planning Analyst",
    bio: "Prevê a procura de produtos e serviços, alinhando oferta com tendências de mercado.",
  },
  {
    name: "Ivan Massingue",
    role: "Logistics IT Specialist",
    bio: "Gere sistemas de informação logística e desenvolve soluções tecnológicas para optimizar processos.",
  },
];

function TeamPage() {
  const {
    submit: submitLead,
    submitting,
    submitted,
    setSubmitted,
    reset: resetLead,
    hpProps,
    whatsappUrl,
  } = useLeadSubmit();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Preencha nome e email");
      return;
    }
    const result = await submitLead({
      type: "application",
      ...form,
    });
    if (result.success) {
      setForm({ name: "", email: "", role: "", message: "" });
    }
  };

  return (
    <SiteLayout>
      <PageHero
        title="A Nossa Equipa"
        subtitle="Profissionais dedicados que trabalham incansavelmente para que cada operação seja executada com a máxima eficiência e cuidado."
        image={aboutTeam}
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-white">
              Início
            </Link>{" "}
            / Equipa
          </span>
        }
      />

      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <Card
                key={m.name}
                className="bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all"
              >
                <CardContent className="p-6">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-bold text-secondary text-lg">{m.name}</h3>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">
                      {m.role}
                    </p>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary text-white">
        <div className="mx-auto max-w-4xl container-px py-16 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
            Junte-se a Nós
          </h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">
            Procuramos talento apaixonado por logística, inovação e excelência. Envie a sua
            candidatura espontânea.
          </p>
          <Button
            size="lg"
            className="mt-7 rounded-full bg-white text-primary hover:bg-white/90 px-7"
            onClick={() => setOpen(true)}
          >
            Candidatura Espontânea
          </Button>
        </div>
      </section>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setSubmitted(false);
            resetLead();
          }
        }}
      >
        <DialogContent>
          {submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Candidatura Enviada</DialogTitle>
                <DialogDescription>
                  Recebemos a sua candidatura. Entraremos em contacto caso o seu perfil corresponda
                  às nossas necessidades.
                </DialogDescription>
              </DialogHeader>
              <FormSuccess
                message="A sua candidatura foi registada com sucesso."
                responseTime="Entraremos em contacto em até 5 dias úteis."
                whatsappUrl={whatsappUrl}
                onClose={() => {
                  setSubmitted(false);
                  resetLead();
                  setOpen(false);
                }}
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Candidatura espontânea</DialogTitle>
                <DialogDescription>
                  Envie-nos os seus dados e juntamos ao nosso pool de talentos.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input {...hpProps} />
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Cargo de interesse</Label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "A enviar..." : "Enviar Candidatura"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
