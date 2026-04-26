import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SITE } from "@/lib/site";
import port from "@/assets/hero-port.jpg";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Roseair Logistics" },
      {
        name: "description",
        content:
          "Fale connosco. Av. Olof Palme nº 798, 2º andar, Maputo, Moçambique. Email: roseair.geral@outlook.com.",
      },
      { property: "og:title", content: "Contacto — Roseair Logistics" },
      { property: "og:description", content: "Telefone, email, WhatsApp e formulário directo para a nossa equipa." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome demasiado curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(6, "Telefone inválido").max(40),
  company: z.string().trim().max(120).optional(),
  service: z.string().min(1, "Selecione um serviço"),
  message: z.string().trim().min(10, "Mensagem demasiado curta").max(1000),
  consent: z.literal(true, { errorMap: () => ({ message: "Aceitação obrigatória" }) }),
});
type FormValues = z.infer<typeof schema>;

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: "", consent: undefined as unknown as true },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Mensagem enviada! A nossa equipa responderá em breve.");
    reset();
    setSubmitting(false);
  };

  return (
    <SiteLayout>
      <PageHero
        title="Fale Connosco"
        subtitle="Estamos prontos para discutir o seu próximo envio. Resposta em menos de 24 horas."
        image={port}
        breadcrumb={<span><Link to="/" className="hover:text-white">Início</Link> / Contacto</span>}
      />

      <section className="bg-background">
        <div className="mx-auto max-w-7xl container-px py-16 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-6 md:p-10">
            <h2 className="text-2xl font-extrabold text-secondary">Envie-nos uma mensagem</h2>
            <p className="mt-2 text-sm text-muted-foreground">Os campos marcados com * são obrigatórios.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" {...register("name")} className="mt-1" />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1" />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input id="phone" {...register("phone")} className="mt-1" />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" {...register("company")} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Tipo de serviço *</Label>
                <Select value={watch("service")} onValueChange={(v) => setValue("service", v, { shouldValidate: true })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccione um serviço" /></SelectTrigger>
                  <SelectContent>
                    {[
                      "Desembaraço Aduaneiro",
                      "Transporte Marítimo",
                      "Transporte Aéreo",
                      "Transporte Terrestre",
                      "Importação & Exportação",
                      "Logística Integrada",
                      "Outro",
                    ].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.service && <p className="mt-1 text-xs text-destructive">{errors.service.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea id="message" rows={5} {...register("message")} className="mt-1" />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={watch("consent") === true}
                  onCheckedChange={(c) => setValue("consent", c === true ? true : (undefined as unknown as true), { shouldValidate: true })}
                />
                <Label htmlFor="consent" className="text-sm leading-snug font-normal cursor-pointer">
                  Aceito a política de privacidade e o tratamento dos meus dados pela Roseair Logistics.
                </Label>
              </div>
              {errors.consent && <p className="-mt-2 text-xs text-destructive">{errors.consent.message}</p>}
              <Button type="submit" size="lg" className="rounded-full w-full h-12 mt-2" disabled={submitting}>
                {submitting ? "A enviar..." : <>Enviar Mensagem <Send className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <InfoItem Icon={MapPin} title="Morada">{SITE.address}</InfoItem>
            <InfoItem Icon={Phone} title="Telefone">
              {SITE.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="block hover:text-primary">{p}</a>
              ))}
            </InfoItem>
            <InfoItem Icon={Mail} title="Email">
              <a href={`mailto:${SITE.email}`} className="hover:text-primary break-all">{SITE.email}</a>
            </InfoItem>
            <InfoItem Icon={Clock} title="Horário">{SITE.hours}</InfoItem>
            <a
              href={SITE.whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-[oklch(0.7_0.18_145)] text-white p-5 shadow-card hover:opacity-95 transition"
            >
              <MessageCircle className="h-6 w-6" fill="currentColor" />
              <div>
                <div className="font-bold">Falar no WhatsApp</div>
                <div className="text-xs opacity-90">Resposta rápida em horário comercial</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Map */}
      <section>
        <iframe
          title="Localização Roseair Logistics"
          src="https://www.google.com/maps?q=Av.+Olof+Palme+798+Maputo&output=embed"
          loading="lazy"
          className="w-full h-[420px] border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </SiteLayout>
  );
}

function InfoItem({
  Icon, title, children,
}: { Icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-card border border-border p-5 flex gap-4">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-sm">
        <div className="font-bold text-secondary">{title}</div>
        <div className="mt-1 text-foreground/80">{children}</div>
      </div>
    </div>
  );
}
