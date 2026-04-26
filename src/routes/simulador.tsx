import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Plane, Truck, Layers, ArrowLeft, ArrowRight, AlertTriangle, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador de Cotação — Roseair Logistics" },
      {
        name: "description",
        content:
          "Calcule uma estimativa do custo de transporte da sua mercadoria — marítimo, aéreo, terrestre ou multimodal. Resposta em segundos.",
      },
      { property: "og:title", content: "Simulador de Cotação — Roseair Logistics" },
      { property: "og:description", content: "Estimativa instantânea para o seu envio. Sem compromisso." },
    ],
  }),
  component: SimulatorPage,
});

type Mode = "maritimo" | "aereo" | "terrestre" | "multimodal";
type TradeType = "importacao" | "exportacao" | "transito";
type Urgency = "normal" | "expresso" | "urgente";

const URGENCY_MULT: Record<Urgency, number> = { normal: 1, expresso: 1.4, urgente: 1.9 };

function calc(mode: Mode, weight: number, volume: number, urgency: Urgency, declaredValue: number) {
  let freight = 0;
  switch (mode) {
    case "maritimo": freight = 200 + weight * 0.8 + volume * 15; break;
    case "aereo": freight = 150 + weight * 3.5; break;
    case "terrestre": freight = 100 + weight * 0.5; break;
    case "multimodal": freight = 175 + weight * 1.6 + volume * 8; break;
  }
  freight *= URGENCY_MULT[urgency];
  const insurance = declaredValue * 0.015;
  const customs = 350;
  return {
    freight: Math.round(freight),
    insurance: Math.round(insurance),
    customs,
    total: Math.round(freight + insurance + customs),
  };
}

function SimulatorPage() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<Mode | null>(null);
  const [tradeType, setTradeType] = useState<TradeType>("importacao");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("Maputo, Moçambique");
  const [weight, setWeight] = useState(500);
  const [volume, setVolume] = useState(2);
  const [goodsType, setGoodsType] = useState("Geral");
  const [declaredValue, setDeclaredValue] = useState(5000);
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({ name: "", email: "", phone: "", company: "" });

  const result = useMemo(
    () => (mode ? calc(mode, weight, volume, urgency, declaredValue) : null),
    [mode, weight, volume, urgency, declaredValue]
  );

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!origin.trim()) e.origin = "Indique a origem";
    if (!destination.trim()) e.destination = "Indique o destino";
    if (weight <= 0) e.weight = "Peso deve ser maior que zero";
    if (declaredValue < 0) e.declaredValue = "Valor inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !mode) { toast.error("Selecione um tipo de serviço"); return; }
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => { setStep(1); setMode(null); setErrors({}); };

  const submitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.name || !proposalForm.email || !proposalForm.phone) {
      toast.error("Preencha nome, email e telefone");
      return;
    }
    toast.success("Pedido enviado! Entraremos em contacto em breve.");
    setProposalOpen(false);
    setProposalForm({ name: "", email: "", phone: "", company: "" });
  };

  const modes: { id: Mode; label: string; Icon: typeof Ship; desc: string }[] = [
    { id: "maritimo", label: "Marítimo", Icon: Ship, desc: "FCL / LCL via Maputo, Beira, Nacala" },
    { id: "aereo", label: "Aéreo", Icon: Plane, desc: "Cargas urgentes e de alto valor" },
    { id: "terrestre", label: "Terrestre", Icon: Truck, desc: "Cobertura SADC" },
    { id: "multimodal", label: "Multimodal", Icon: Layers, desc: "Combinação otimizada" },
  ];

  return (
    <SiteLayout>
      <section className="bg-secondary text-white">
        <div className="mx-auto max-w-5xl container-px py-14 md:py-20">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Cotação online</span>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">Simulador de Cotação de Frete</h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            Calcule uma estimativa do custo de transporte da sua mercadoria em 3 passos simples.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl container-px py-12">
          {/* Disclaimer */}
          <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 flex gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-yellow-900">
              <strong>Aviso legal:</strong> Os valores apresentados são estimativas indicativas. O valor final será confirmado pela nossa equipa após análise detalhada.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span className={step >= 1 ? "text-primary" : ""}>1. Tipo de Serviço</span>
              <span className={step >= 2 ? "text-primary" : ""}>2. Detalhes</span>
              <span className={step >= 3 ? "text-primary" : ""}>3. Resultado</span>
            </div>
            <Progress value={(step / 3) * 100} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <h2 className="text-xl font-bold text-secondary">Que tipo de transporte pretende?</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {modes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`text-left rounded-xl border-2 p-5 transition-all hover:shadow-card-hover ${
                        mode === m.id ? "border-primary bg-primary/5 shadow-card-hover" : "border-border bg-white"
                      }`}
                    >
                      <m.Icon className={`h-9 w-9 ${mode === m.id ? "text-primary" : "text-secondary"}`} />
                      <div className="mt-3 font-bold text-secondary">{m.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="mt-8 space-y-6"
              >
                <h2 className="text-xl font-bold text-secondary">Detalhes da carga</h2>

                <div>
                  <Label className="text-sm font-semibold">Tipo de operação</Label>
                  <RadioGroup
                    value={tradeType}
                    onValueChange={(v) => setTradeType(v as TradeType)}
                    className="mt-2 grid grid-cols-3 gap-3"
                  >
                    {[
                      { v: "importacao", l: "Importação" },
                      { v: "exportacao", l: "Exportação" },
                      { v: "transito", l: "Trânsito" },
                    ].map((o) => (
                      <Label
                        key={o.v}
                        htmlFor={`tt-${o.v}`}
                        className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:border-primary ${
                          tradeType === o.v ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem id={`tt-${o.v}`} value={o.v} />
                        <span className="text-sm font-medium">{o.l}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="origin">Origem</Label>
                    <Input
                      id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Ex: Shanghai, China" className="mt-1"
                    />
                    {errors.origin && <p className="text-xs text-destructive mt-1">{errors.origin}</p>}
                  </div>
                  <div>
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}
                      placeholder="Ex: Maputo, Moçambique" className="mt-1"
                    />
                    {errors.destination && <p className="text-xs text-destructive mt-1">{errors.destination}</p>}
                  </div>
                </div>

                <div>
                  <Label>Peso estimado: <span className="text-primary font-bold">{weight.toLocaleString("pt-PT")} kg</span></Label>
                  <div className="mt-2 flex gap-3 items-center">
                    <Slider
                      value={[weight]} onValueChange={(v) => setWeight(v[0])}
                      min={1} max={20000} step={10} className="flex-1"
                    />
                    <Input
                      type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || 0)}
                      className="w-28"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="vol">Volume (m³)</Label>
                    <Input
                      id="vol" type="number" value={volume}
                      onChange={(e) => setVolume(Number(e.target.value) || 0)} className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goods">Tipo de mercadoria</Label>
                    <Select value={goodsType} onValueChange={setGoodsType}>
                      <SelectTrigger id="goods" className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Geral", "Perecível", "Frágil", "Perigoso", "Automóveis", "Outros"].map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dv">Valor declarado (USD)</Label>
                    <Input
                      id="dv" type="number" value={declaredValue}
                      onChange={(e) => setDeclaredValue(Number(e.target.value) || 0)} className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urg">Urgência</Label>
                    <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                      <SelectTrigger id="urg" className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal (15–30 dias)</SelectItem>
                        <SelectItem value="expresso">Expresso (7–15 dias)</SelectItem>
                        <SelectItem value="urgente">Urgente (1–7 dias)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <div className="rounded-2xl bg-secondary text-white p-8 shadow-card-hover">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                    <h2 className="text-xl font-bold">Estimativa Calculada</h2>
                  </div>
                  <div className="mt-6 space-y-3">
                    <Row label="Estimativa de Frete" value={`$ ${result.freight.toLocaleString("pt-PT")}`} />
                    <Row label="Estimativa de Seguro (1.5%)" value={`$ ${result.insurance.toLocaleString("pt-PT")}`} />
                    <Row label="Taxa Estimada de Desembaraço" value={`$ ${result.customs.toLocaleString("pt-PT")}`} />
                    <div className="border-t border-white/15 pt-4 flex justify-between items-baseline">
                      <span className="text-sm uppercase tracking-wider text-white/70">Total Estimado</span>
                      <span className="text-3xl md:text-4xl font-extrabold text-primary">
                        $ {result.total.toLocaleString("pt-PT")}
                      </span>
                    </div>
                  </div>
                  <p className="mt-6 text-xs text-white/60 italic">
                    Simulação meramente indicativa. Sujeita a confirmação após análise detalhada pela nossa equipa.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <Button size="lg" className="rounded-full px-7 h-12" onClick={() => setProposalOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" /> Receber Proposta Real por Email
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-7 h-12" onClick={reset}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refazer Simulação
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step nav */}
          {step < 3 && (
            <div className="mt-10 flex justify-between">
              <Button variant="outline" onClick={back} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
              <Button onClick={next}>
                {step === 2 ? "Calcular" : "Próximo"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receber proposta personalizada</DialogTitle>
            <DialogDescription>
              Deixe os seus contactos. A nossa equipa comercial responderá em menos de 24h.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProposal} className="space-y-3">
            <div>
              <Label htmlFor="pn">Nome *</Label>
              <Input id="pn" value={proposalForm.name} onChange={(e) => setProposalForm({ ...proposalForm, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="pe">Email *</Label>
              <Input id="pe" type="email" value={proposalForm.email} onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="pp">Telefone *</Label>
              <Input id="pp" value={proposalForm.phone} onChange={(e) => setProposalForm({ ...proposalForm, phone: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="pc">Empresa</Label>
              <Input id="pc" value={proposalForm.company} onChange={(e) => setProposalForm({ ...proposalForm, company: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Enviar Pedido</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/80">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
