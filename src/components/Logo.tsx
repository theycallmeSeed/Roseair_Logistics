import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";

interface LogoProps {
  variant?: "default" | "light";
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Roseair Logistics — Início"
    >
      <img
        src={logo}
        alt="Roseair Logistics"
        className="h-12 w-auto object-contain"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
