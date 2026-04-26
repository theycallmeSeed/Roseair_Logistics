import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("rs_cookies_ok")) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem("rs_cookies_ok", "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:inset-x-auto md:left-1/2 md:bottom-5 md:-translate-x-1/2 md:max-w-3xl">
      <div className="rounded-xl bg-white shadow-card-hover border border-border p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-3">
        <p className="text-sm text-foreground/80 flex-1">
          Utilizamos cookies para melhorar a sua experiência no site. Ao continuar, concorda com a nossa política de cookies.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={dismiss}>Gerir Preferências</Button>
          <Button size="sm" onClick={dismiss}>Aceitar Todos</Button>
        </div>
      </div>
    </div>
  );
}
