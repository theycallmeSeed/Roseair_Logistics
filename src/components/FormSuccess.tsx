import { CheckCircle2, MessageCircle, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

interface FormSuccessProps {
  title?: string;
  message?: string;
  responseTime?: string;
  onClose?: () => void;
  whatsappUrl?: string;
}

export function FormSuccess({
  title = "Mensagem enviada com sucesso!",
  message,
  responseTime = "Responderemos em até 24 horas úteis.",
  onClose,
  whatsappUrl,
}: FormSuccessProps) {
  return (
    <div className="text-center py-2">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-secondary">{title}</h3>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}

      <div className="mt-6 space-y-3 text-left">
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-secondary">Tempo de Resposta</div>
            <p className="text-sm text-muted-foreground">{responseTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-secondary">Próximo Passo</div>
            <p className="text-sm text-muted-foreground">
              Enquanto aguarda, fale connosco directamente no{" "}
              <a
                href={whatsappUrl ?? SITE.whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                WhatsApp
              </a>{" "}
              para acelerar o processo.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-secondary">Contacto Comercial</div>
            <a
              href={`mailto:${SITE.email}`}
              className="text-sm text-primary underline hover:no-underline"
            >
              {SITE.email}
            </a>
          </div>
        </div>
      </div>

      {onClose && (
        <Button variant="outline" className="mt-6 rounded-full w-full" onClick={onClose}>
          Fechar
        </Button>
      )}
    </div>
  );
}
