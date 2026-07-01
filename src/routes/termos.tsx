import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Roseair Logistics" },
      {
        name: "description",
        content:
          "Termos e condições de uso do website da Roseair Logistics, SA.",
      },
      {
        property: "og:title",
        content: "Termos de Uso — Roseair Logistics",
      },
      {
        property: "og:description",
        content: "Termos e condições de utilização do site.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <SiteLayout>
      <PageHero
        title="Termos de Uso"
        subtitle="Condições gerais de utilização deste website."
        image=""
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-white">
              Início
            </Link>{" "}
            / Termos
          </span>
        }
      />

      <section className="bg-background">
        <div className="mx-auto max-w-4xl container-px py-16">
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Identificação
              </h2>
              <p>
                O website <strong>roseair.co.mz</strong> é propriedade da {SITE.name},
                com sede na {SITE.address}.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Aceitação dos Termos
              </h2>
              <p>
                Ao utilizar este website, o utilizador aceita os presentes termos e condições
                de uso. Se não concordar com algum dos termos, não deverá utilizar este site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Objeto
              </h2>
              <p>
                Este website tem como objetivo apresentar os serviços de logística,
                transporte, desembaraço aduaneiro e soluções integradas da {SITE.name},
                bem como disponibilizar um simulador de custos e permitir o contacto com
                a nossa equipa comercial.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Simulador de Custos
              </h2>
              <p>
                O simulador de custos disponibilizado neste website fornece estimativas
                meramente indicativas, baseadas nos dados inseridos pelo utilizador. Os
                valores apresentados não constituem uma proposta vinculativa. Para uma
                cotação formal e personalizada, solicite uma proposta através do formulário
                de pedido de cotação.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Propriedade Intelectual
              </h2>
              <p>
                Todo o conteúdo presente neste website, incluindo textos, imagens, logótipos
                e elementos gráficos, é propriedade da {SITE.name} ou utilizado com
                autorização, estando protegido pelas leis de propriedade intelectual.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Limitação de Responsabilidade
              </h2>
              <p>
                A {SITE.name} não se responsabiliza por danos diretos ou indiretos
                decorrentes da utilização deste website, nomeadamente por interrupções,
                erros técnicos, ou imprecisões nas informações disponibilizadas. O
                simulador de custos é uma ferramenta de apoio e não substitui uma
                consulta formal à nossa equipa.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Links Externos
              </h2>
              <p>
                Este website pode conter links para sites externos. A {SITE.name} não
                se responsabiliza pelo conteúdo, políticas de privacidade ou práticas
                de terceiros.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Lei Aplicável
              </h2>
              <p>
                Estes termos são regidos pela lei moçambicana. Qualquer litígio decorrente
                da utilização deste website será submetido à jurisdição dos tribunais da
                cidade de Maputo, Moçambique.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">Contacto</h2>
              <p>
                Para qualquer questão relacionada com estes termos, contacte-nos através do
                email{" "}
                <a href={`mailto:${SITE.email}`} className="text-primary underline">
                  {SITE.email}
                </a>
                .
              </p>
            </div>

            <div className="text-sm text-muted-foreground/70 border-t border-border pt-6">
              Última atualização: Julho de 2026.
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
