"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Bike, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type Role = "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER";
type LinkItem = { href: string; label: string; roles?: Role[] };

const ALL_LINKS: LinkItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/booking", label: "Booking" },
  { href: "/sparepart", label: "Sparepart" },
  { href: "/progress", label: "Live Progress" },
  { href: "/modif", label: "Modif Corner" },
  { href: "/points", label: "RR Points" },
  { href: "/admin", label: "Dashboard", roles: ["ADMIN"] },
  { href: "/mekanik", label: "Workshop", roles: ["MECHANIC", "ADMIN"] },
  { href: "/kasir", label: "Kasir", roles: ["ADMIN", "KASIR"] },
];

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  MECHANIC: "Mekanik",
  KASIR: "Kasir",
  CUSTOMER: "Customer",
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, openLogin, logout } = useAuth();

  const links = ALL_LINKS.filter(
    (l) =>
      !l.roles ||
      (user && l.roles.includes(user.role))
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line glass">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg neon-border">
            <Bike className="h-5 w-5 neon-text" />
          </span>
          <span className="text-lg">
            RR<span className="neon-text">MOTOR</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(l.href)
                    ? "neon-text font-medium"
                    : "text-muted hover:text-light"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <User className="h-4 w-4 neon-text" />
                <span>{user.username}</span>
                <span className="rounded bg-neon/10 px-1.5 py-0.5 text-[10px] neon-text">
                  {ROLE_LABEL[user.role]}
                </span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:border-magenta hover:text-magenta"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={openLogin}
              className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-light hover:border-neon hover:text-neon"
            >
              <LogIn className="h-4 w-4 neon-text" /> Login
            </button>
          )}
          {user ? (
            <Link
              href="/booking"
              className="rounded-lg px-4 py-2 text-sm font-semibold glow-btn hover:glow-btn-hover"
            >
              Booking Sekarang
            </Link>
          ) : (
            <button
              onClick={openLogin}
              className="rounded-lg px-4 py-2 text-sm font-semibold glow-btn hover:glow-btn-hover"
            >
              Booking Anti-Antre
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-light md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-sm ${
                    isActive(l.href) ? "neon-text font-medium" : "text-muted"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="py-2">
              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-line px-3 py-3 text-sm font-semibold text-muted"
                >
                  <LogOut className="h-4 w-4" /> Logout ({user.username})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    openLogin();
                  }}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-line px-3 py-3 text-sm font-semibold text-light"
                >
                  <LogIn className="h-4 w-4 neon-text" /> Login
                </button>
              )}
            </li>
            <li className="pb-2">
              {user ? (
                <Link
                  href="/booking"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-center text-sm font-semibold glow-btn"
                >
                  Booking Sekarang
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    openLogin();
                  }}
                  className="block w-full rounded-lg px-3 py-3 text-center text-sm font-semibold glow-btn"
                >
                  Booking Anti-Antre
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
