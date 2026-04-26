import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFAB } from "./WhatsAppFAB";
import { CookieBanner } from "./CookieBanner";

interface SiteLayoutProps {
  children: ReactNode;
  /** When true, navbar is transparent over the hero until scroll. */
  transparentNav?: boolean;
}

export function SiteLayout({ children, transparentNav = false }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar transparentOnTop={transparentNav} />
      <main className={transparentNav ? "" : "pt-16 lg:pt-[68px]"}>{children}</main>
      <Footer />
      <WhatsAppFAB />
      <CookieBanner />
    </div>
  );
}
