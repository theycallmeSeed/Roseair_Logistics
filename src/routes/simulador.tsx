import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ArrowLeft, ArrowRight, AlertTriangle, RefreshCw, Mail, CheckCircle2, Car, Package } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador de Desembaraço Aduaneiro — Roseair Logistics" },
      {
        name: "description",
        content:
          "Calcule uma estimativa de direitos aduaneiros, ICE e IVA da sua importação para Moçambique. Resposta em segundos.",
      },
      { property: "og:title", content: "Simulador de Desembaraço Aduaneiro — Roseair Logistics" },
      { property: "og:description", content: "Estimativa instantânea de taxas aduaneiras. Sem compromisso." },
    ],
  }),
  component: SimulatorPage,
});

type Currency = "USD" | "MZN" | "ZAR";
type ClearanceType = "normal" | "expresso" | "prioritario";

type TaxConfig = {
  id: string;
  label: string;
  group: "geral" | "veiculos";
  da: number;
  ice?: number;
  iva?: number;
  sobretaxa?: number;
};

const TAX_CATEGORIES: TaxConfig[] = [
  // GENERAL
  { id: "g_construcao", group: "geral", label: "Material de construção", da: 0.075, iva: 0.16 },
  { id: "g_eletrico", group: "geral", label: "Material elétrico", da: 0.075, iva: 0.16 },
  { id: "g_mobilia", group: "geral", label: "Mobília e móveis", da: 0.20, iva: 0.16 },
  { id: "g_maquinas", group: "geral", label: "Máquinas e equipamentos", da: 0.05, iva: 0.16 },
  { id: "g_textil", group: "geral", label: "Material têxtil", da: 0.20, iva: 0.16 },
  // VEHICLES
  { id: "v_pass_diesel_10", group: "veiculos", label: "Transporte passageiros diesel (10+)", da: 0.05, iva: 0.16 },
  { id: "v_pass_gas_10", group: "veiculos", label: "Transporte passageiros gasolina (10+)", da: 0.05, ice: 0.30, iva: 0.16 },
  { id: "v_gas_1000", group: "veiculos", label: "Gasolina até 1000cc", da: 0.20, ice: 0.05, iva: 0.16 },
  { id: "v_gas_1500", group: "veiculos", label: "Gasolina 1000cc–1500cc", da: 0.20, ice: 0.10, iva: 0.16 },
  { id: "v_gas_1500_plus", group: "veiculos", label: "Gasolina acima 1500cc", da: 0.20, ice: 0.30, iva: 0.16 },
  { id: "v_diesel_1500", group: "veiculos", label: "Diesel até 1500cc", da: 0.20, ice: 0.10, iva: 0.16 },
  { id: "v_diesel_1500_plus", group: "veiculos", label: "Diesel acima 1500cc", da: 0.20, ice: 0.30, iva: 0.16 },
  { id: "v_hibridos", group: "veiculos", label: "Híbridos", da: 0.20, ice: 0.30, iva: 0.16 },
  { id: "v_merc_diesel_5t", group: "veiculos", label: "Mercadorias diesel até 5 toneladas", da: 0.05, iva: 0 },
  { id: "v_merc_diesel_5t_plus", group: "veiculos", label: "Mercadorias diesel acima 5 toneladas", da: 0.05, iva: 0.16 },
  { id: "v_merc_diesel_est", group: "veiculos", label: "Mercadorias diesel cabine estendida", da: 0.05, iva: 0.16 },
  { id: "v_merc_diesel_dupla", group: "veiculos", label: "Mercadorias diesel cabine dupla", da: 0.05, ice: 0.30, iva: 0.16 },
  { id: "v_merc_gas_5t", group: "veiculos", label: "Mercadorias gasolina até 5 toneladas", da: 0.05, iva: 0.16 },
  { id: "v_merc_gas_5t_plus", group: "veiculos", label: "Mercadorias gasolina acima 5 toneladas", da: 0.05, iva: 0.16 },
  { id: "v_merc_gas_est", group: "veiculos", label: "Mercadorias gasolina cabine estendida", da: 0.05, iva: 0.16 },
  { id: "v_merc_gas_dupla", group: "veiculos", label: "Mercadorias gasolina cabine dupla", da: 0.05, ice: 0.30, iva: 0.16 },
  { id: "v_merc_hibridas", group: "veiculos", label: "Mercadorias híbridas", da: 0.05, iva: 0.16 },
  { id: "v_especiais", group: "veiculos", label: "Veículos especiais", da: 0.05, iva: 0.16 },
];

function calcCustoms(
  fob: number,
  declaredFreight: number | null,
  exchangeRate: number,
  categoryId: string,
  clearanceType: ClearanceType
) {
  const cat = TAX_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return null;

  const freight = declaredFreight !== null ? declaredFreight : fob * 0.10;
  const insurance = (fob + freight) * 0.02;
  const cif = fob + freight + insurance;
  const cifMt = cif * exchangeRate;

  const da = cifMt * cat.da;
  const ice = cat.ice ? cifMt * cat.ice : 0;
  const iva = cat.iva ? (cifMt + da + ice) * cat.iva : 0;
  const sobretaxa = cat.sobretaxa ? cif * cat.sobretaxa * exchangeRate : 0;

  let fee = 0;
  if (clearanceType === "normal") fee = 2500;
  else if (clearanceType === "expresso") fee = 7500;
  else if (clearanceType === "prioritario") fee = 15000;

  const totalTaxes = da + ice + iva + sobretaxa;
  const total = cifMt + totalTaxes + fee;

  return {
    fob,
    freight,
    insurance,
    cif,
    cifMt,
    da,
    ice,
    iva,
    sobretaxa,
    fee,
    totalTaxes,
    total,
  };
}

function SimulatorPage() {
  const [step, setStep] = useState(1);
  const [group, setGroup] = useState<"geral" | "veiculos" | null>(null);
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("Maputo, Moçambique");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState(63.20);
  const [fob, setFob] = useState(10000);
  const [declaredFreight, setDeclaredFreight] = useState<string>("");
  const [categoryId, setCategoryId] = useState("");
  const [clearanceType, setClearanceType] = useState<ClearanceType>("normal");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({ name: "", email: "", phone: "", company: "" });

  const result = useMemo(() => {
    if (!categoryId) return null;
    const freightVal = declaredFreight !== "" ? Number(declaredFreight) : null;
    return calcCustoms(fob, freightVal, exchangeRate, categoryId, clearanceType);
  }, [fob, declaredFreight, exchangeRate, categoryId, clearanceType]);

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!origin.trim()) e.origin = "Indique a origem";
    if (!destination.trim()) e.destination = "Indique o destino";
    if (fob <= 0) e.fob = "Valor FOB deve ser maior que zero";
    if (exchangeRate <= 0) e.exchangeRate = "Taxa de câmbio inválida";
    if (!categoryId) e.categoryId = "Selecione a categoria de mercadoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !group) { toast.error("Selecione um grupo de mercadoria"); return; }
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => { setStep(1); setGroup(null); setCategoryId(""); setErrors({}); };

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

  const groups = [
    { id: "geral", label: "Mercadorias Gerais", Icon: Package, desc: "Materiais, móveis, máquinas, etc." },
    { id: "veiculos", label: "Veículos", Icon: Car, desc: "Ligeiros, pesados e especiais" },
  ] as const;

  const filteredCategories = TAX_CATEGORIES.filter(c => c.group === group);

  const fmt = (val: number, cur: string = "MZN") => {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: cur }).format(val);
  };

  return (
    <SiteLayout>
      <section className="bg-secondary text-white">
        <div className="mx-auto max-w-5xl container-px py-14 md:py-20">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Cotação online</span>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">Simulador de Desembaraço Aduaneiro</h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            Calcule uma estimativa dos direitos aduaneiros, impostos e taxas da sua importação em 3 passos simples.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl container-px py-12">
          {/* Disclaimer */}
          <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 flex gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-yellow-900 leading-relaxed">
              <strong>Aviso legal:</strong> Os valores apresentados são meramente estimativos. 
              O valor final aduaneiro pode variar conforme a legislação em vigor, classificação pautal oficial, isenções aplicáveis e validação final da Autoridade Tributária.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span className={step >= 1 ? "text-primary" : ""}>1. Tipo de Carga</span>
              <span className={step >= 2 ? "text-primary" : ""}>2. Detalhes Financeiros</span>
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
                <h2 className="text-xl font-bold text-secondary">Qual é o grupo da sua mercadoria?</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { setGroup(g.id); setCategoryId(""); }}
                      className={`text-left rounded-xl border-2 p-6 transition-all hover:shadow-card-hover ${
                        group === g.id ? "border-primary bg-primary/5 shadow-card-hover" : "border-border bg-white"
                      }`}
                    >
                      <g.Icon className={`h-10 w-10 ${group === g.id ? "text-primary" : "text-secondary"}`} />
                      <div className="mt-4 text-lg font-bold text-secondary">{g.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">{g.desc}</div>
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
                <h2 className="text-xl font-bold text-secondary">Detalhes da Importação</h2>

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
                    <Label htmlFor="destination">Destino / Alfândega</Label>
                    <Input
                      id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}
                      placeholder="Ex: Maputo, Moçambique" className="mt-1"
                    />
                    {errors.destination && <p className="text-xs text-destructive mt-1">{errors.destination}</p>}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Select value={currency} onValueChange={(v) => {
                      const cur = v as Currency;
                      setCurrency(cur);
                      if (cur === "MZN") setExchangeRate(1);
                      else if (cur === "USD") setExchangeRate(63.20);
                      else if (cur === "ZAR") setExchangeRate(3.50);
                    }}>
                      <SelectTrigger id="currency" className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                        <SelectItem value="MZN">MZN - Metical</SelectItem>
                        <SelectItem value="ZAR">ZAR - Rand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fob">Valor FOB ({currency})</Label>
                    <Input
                      id="fob" type="number" value={fob || ""}
                      onChange={(e) => setFob(Number(e.target.value) || 0)} className="mt-1"
                    />
                    {errors.fob && <p className="text-xs text-destructive mt-1">{errors.fob}</p>}
                  </div>
                  <div>
                    <Label htmlFor="exchange">Câmbio ({currency} → MZN)</Label>
                    <Input
                      id="exchange" type="number" value={exchangeRate || ""}
                      onChange={(e) => setExchangeRate(Number(e.target.value) || 0)} className="mt-1"
                      disabled={currency === "MZN"}
                    />
                    {errors.exchangeRate && <p className="text-xs text-destructive mt-1">{errors.exchangeRate}</p>}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="freight">Frete Declarado ({currency}) - <span className="text-muted-foreground font-normal">Opcional</span></Label>
                    <Input
                      id="freight" type="number" value={declaredFreight}
                      onChange={(e) => setDeclaredFreight(e.target.value)} className="mt-1"
                      placeholder="Deixe vazio para usar 10% do FOB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria da Mercadoria</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{group === "geral" ? "Gerais" : "Veículos"}</SelectLabel>
                          {filteredCategories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId}</p>}
                  </div>
                </div>

                <div>
                  <Label>Tipo de Desembaraço</Label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { v: "normal", l: "Normal", d: "Padrão" },
                      { v: "expresso", l: "Expresso", d: "Rápido" },
                      { v: "prioritario", l: "Prioritário", d: "Urgente" },
                    ].map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setClearanceType(o.v as ClearanceType)}
                        className={`text-left rounded-lg border p-3 cursor-pointer hover:border-primary transition-all ${
                          clearanceType === o.v ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border"
                        }`}
                      >
                        <div className="text-sm font-bold text-secondary">{o.l}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{o.d}</div>
                      </button>
                    ))}
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
                <div className="rounded-2xl bg-secondary text-white p-6 md:p-8 shadow-card-hover">
                  <div className="flex items-center gap-3 border-b border-white/15 pb-4 mb-5">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                    <h2 className="text-xl font-bold">Estimativa de Desembaraço</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Base values */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Valores Base</h3>
                      <Row label="Valor FOB" value={fmt(result.fob, currency)} />
                      <Row label="Frete (Estimado/Declarado)" value={fmt(result.freight, currency)} />
                      <Row label="Seguro (2%)" value={fmt(result.insurance, currency)} />
                      <div className="border-t border-white/15 pt-2 mt-2">
                        <Row label="Valor CIF" value={fmt(result.cif, currency)} />
                        <Row label="Valor CIF (Base de Cálculo)" value={fmt(result.cifMt)} highlight />
                      </div>
                    </div>

                    {/* Taxes */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Impostos e Taxas (MZN)</h3>
                      <Row label="Direitos Aduaneiros (D.A.)" value={fmt(result.da)} />
                      {result.ice > 0 && <Row label="ICE" value={fmt(result.ice)} />}
                      {result.iva > 0 && <Row label="IVA" value={fmt(result.iva)} />}
                      {result.sobretaxa > 0 && <Row label="Sobretaxa" value={fmt(result.sobretaxa)} />}
                      <Row label="Taxa Administrativa/Desembaraço" value={fmt(result.fee)} />
                      
                      <div className="border-t border-white/15 pt-2 mt-2">
                        <Row label="Total de Impostos e Taxas" value={fmt(result.totalTaxes + result.fee)} highlight />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-primary/10 border border-primary/20 p-5 flex flex-col sm:flex-row justify-between items-baseline gap-2">
                    <span className="text-sm uppercase tracking-wider font-semibold text-white/90">Custo Total Estimado (CIF + Impostos)</span>
                    <span className="text-3xl md:text-4xl font-extrabold text-primary">
                      {fmt(result.total)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <Button size="lg" className="rounded-full px-7 h-12" onClick={() => setProposalOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" /> Receber Proposta Real
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

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={highlight ? "text-white font-semibold" : "text-white/80"}>{label}</span>
      <span className={highlight ? "font-extrabold text-primary" : "font-bold"}>{value}</span>
    </div>
  );
}
