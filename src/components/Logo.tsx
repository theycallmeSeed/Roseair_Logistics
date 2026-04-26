import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "default" | "light";
  className?: string;
}

export function Logo({ variant = "default", className = "" }: LogoProps) {
  const isLight = variant === "light";
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Roseair Logistics — Início">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-md ${
          isLight ? "bg-white/10" : "bg-primary/10"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary" aria-hidden="true">
          <path
            d="M2 12L9 14L11 21L13 13L21 11L4 4L2 12Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight text-lg ${isLight ? "text-white" : "text-primary"}`}>
          ROSEAIR
        </span>
        <span className={`text-[10px] font-bold tracking-[0.2em] ${isLight ? "text-white/80" : "text-secondary"}`}>
          LOGISTICS, SA
        </span>
      </span>
    </Link>
  );
}
