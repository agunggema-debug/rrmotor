import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="py-10 sm:py-14">
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] neon-text">
          {eyebrow}
        </span>
      )}
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-muted sm:text-lg">{description}</p>
      )}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-muted">
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function CTAButton({
  href,
  children,
  variant = "neon",
}: {
  href: string;
  children: ReactNode;
  variant?: "neon" | "outline";
}) {
  const cls =
    variant === "neon"
      ? "glow-btn rounded-xl px-5 py-3 text-sm font-semibold hover:glow-btn-hover"
      : "rounded-xl border border-line px-5 py-3 text-sm font-semibold text-light hover:border-neon hover:text-neon";
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
