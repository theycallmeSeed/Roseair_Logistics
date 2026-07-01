import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Roseair Logistics" },
      {
        name: "description",
        content:
          "Política de privacidade da Roseair Logistics, SA. Saiba como tratamos os seus dados pessoais.",
      },
      {
        property: "og:title",
        content: "Política de Privacidade — Roseair Logistics",
      },
      {
        property: "og:description",
        content: "Transparência no tratamento de dados pessoais.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <SiteLayout>
      <PageHero
        title="Política de Privacidade"
        subtitle="Como tratamos e protegemos os seus dados pessoais."
        image=""
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-white">
              Início
            </Link>{" "}
            / Privacidade
          </span>
        }
      />

      <section className="bg-background">
        <div className="mx-auto max-w-4xl container-px py-16">
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Responsável pelo Tratamento
              </h2>
              <p>
                A {SITE.name}, com sede na {SITE.address}, é a responsável pelo tratamento
                dos dados pessoais recolhidos através deste website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Dados Recolhidos
              </h2>
              <p>Podemos recolher as seguintes categorias de dados pessoais:</p>
              <ul className="mt-3 list-disc pl-6 space-y-1">
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>Número de telefone</li>
                <li>Nome da empresa e cargo</li>
                <li>Informações sobre serviços de interesse</li>
                <li>Mensagens e comunicações enviadas através dos formulários</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Finalidades do Tratamento
              </h2>
              <p>Os seus dados são tratados para as seguintes finalidades:</p>
              <ul className="mt-3 list-disc pl-6 space-y-1">
                <li>Responder a pedidos de cotação e informações sobre serviços</li>
                <li>Processar candidaturas espontâneas</li>
                <li>Prestar serviços de logística, transporte e desembaraço aduaneiro</li>
                <li>Enviar comunicações relacionadas com os serviços contratados</li>
                <li>Cumprir obrigações legais e regulamentares</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Base Legal
              </h2>
              <p>
                O tratamento dos seus dados baseia-se no seu consentimento, na execução de
                medidas pré-contratuais a seu pedido, e no cumprimento de obrigações legais
                a que a {SITE.name} se encontra sujeita.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Partilha de Dados
              </h2>
              <p>
                Os seus dados não serão partilhados com terceiros, exceto quando necessário
                para o cumprimento de obrigações legais, ou com prestadores de serviços que
                atuam como subcontratantes ao abrigo de contrato (por exemplo, serviços de
                email e alojamento web).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Prazo de Conservação
              </h2>
              <p>
                Os dados pessoais são conservados pelo período necessário à prossecução das
                finalidades para as quais foram recolhidos, ou pelo período legalmente exigido.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">
                Os Seus Direitos
              </h2>
              <p>Nos termos da lei aplicável, pode exercer os seguintes direitos:</p>
              <ul className="mt-3 list-disc pl-6 space-y-1">
                <li>Acesso aos seus dados pessoais</li>
                <li>Retificação de dados inexatos ou incompletos</li>
                <li>Eliminação dos seus dados (direito ao esquecimento)</li>
                <li>Limitação do tratamento</li>
                <li>Portabilidade dos dados</li>
                <li>Oposição ao tratamento</li>
              </ul>
              <p className="mt-3">
                Para exercer estes direitos, contacte-nos através do email{" "}
                <a href={`mailto:${SITE.email}`} className="text-primary underline">
                  {SITE.email}
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-secondary mb-4">Alterações</h2>
              <p>
                A presente política de privacidade pode ser atualizada periodicamente.
                Recomendamos a sua consulta regular.
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
