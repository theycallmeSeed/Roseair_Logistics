import logo from "@/assets/logo.webp";
import logoTransparent from "@/assets/logo-transparente.webp";
import { Link } from "@tanstack/react-router";

interface LogoProps {
  transparent?: boolean;
  className?: string;
}

export function Logo({ transparent = false, className = "" }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Roseair Logistics — Início"
      className={`inline-flex items-center ${className}`}
    >
      <img
        src={transparent ? logoTransparent : logo}
        alt="Roseair Logistics"
        className="h-12 w-auto object-contain"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
