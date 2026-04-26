import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/site";

interface NavbarProps {
  /** When true, the navbar starts transparent over a hero and turns solid on scroll. */
  transparentOnTop?: boolean;
}

export function Navbar({ transparentOnTop = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"PT" | "EN">("PT");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const solid = !transparentOnTop || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "bg-white shadow-nav" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between container-px py-3">
        <Logo variant={solid ? "default" : "light"} />

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className={`text-sm font-medium transition-colors ${
                solid ? "text-secondary hover:text-primary" : "text-white hover:text-white/80"
              }`}
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <div
            className={`flex items-center text-xs font-semibold rounded-full border ${
              solid ? "border-border text-secondary" : "border-white/30 text-white"
            }`}
          >
            <button
              onClick={() => setLang("PT")}
              className={`px-2.5 py-1 rounded-full ${lang === "PT" ? "bg-primary text-primary-foreground" : ""}`}
              aria-pressed={lang === "PT"}
            >
              PT
            </button>
            <button
              onClick={() => setLang("EN")}
              className={`px-2.5 py-1 rounded-full ${lang === "EN" ? "bg-primary text-primary-foreground" : ""}`}
              aria-pressed={lang === "EN"}
            >
              EN
            </button>
          </div>
          <Button asChild size="sm" className="rounded-full px-5 font-semibold">
            <Link to="/simulador">Pedir Cotação</Link>
          </Button>
        </div>

        <button
          className={`lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md ${
            solid ? "text-secondary" : "text-white"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden bg-white border-t border-border transition-[max-height] duration-300 ${
          open ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col p-4 gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-md px-3 py-3 text-base font-medium text-secondary hover:bg-muted"
              activeProps={{ className: "text-primary bg-muted" }}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild className="mt-3 w-full rounded-full">
            <Link to="/simulador">Pedir Cotação</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
