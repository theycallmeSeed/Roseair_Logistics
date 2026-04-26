import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Linkedin, Facebook, Instagram } from "lucide-react";
import { Logo } from "./Logo";
import { SITE, NAV_LINKS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl container-px py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="rounded-md bg-white/5 p-3 inline-block">
              <Logo variant="light" />
            </div>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              {SITE.tagline}. Soluções integradas de logística, transporte e desembaraço aduaneiro em Moçambique e na região SADC.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Linkedin, href: SITE.social.linkedin, label: "LinkedIn" },
                { Icon: Facebook, href: SITE.social.facebook, label: "Facebook" },
                { Icon: Instagram, href: SITE.social.instagram, label: "Instagram" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Navegação</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Serviços</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Desembaraço Aduaneiro</li>
              <li>Transporte Marítimo</li>
              <li>Transporte Aéreo</li>
              <li>Transporte Terrestre</li>
              <li>Importação & Exportação</li>
              <li>Logística Integrada</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  {SITE.phones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="block hover:text-white">
                      {p}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white break-all">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
