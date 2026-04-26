import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
  breadcrumb?: ReactNode;
}

export function PageHero({ title, subtitle, image, breadcrumb }: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.27 0.09 265 / 0.92), oklch(0.27 0.09 265 / 0.78)), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-7xl container-px py-20 md:py-28 text-white">
        {breadcrumb && <div className="mb-4 text-sm text-white/70">{breadcrumb}</div>}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl">{subtitle}</p>
        )}
        <div className="mt-6 h-1 w-20 bg-primary rounded-full" />
      </div>
    </section>
  );
}
