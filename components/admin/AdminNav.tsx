"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/parametros", label: "Parâmetros" },
  { href: "/admin/revendedores", label: "Revendedores" },
  { href: "/admin/master-trainers", label: "Master Trainers" },
  { href: "/admin/leads", label: "Contatos" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-6">
          <span className="chrome-text text-sm font-black uppercase tracking-widest">
            Zvizzer Admin
          </span>
          <div className="hidden gap-4 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium",
                  pathname === link.href ? "text-accent" : "text-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-muted hover:text-danger">
          Sair
        </button>
      </nav>
      <div className="flex gap-4 border-t border-border px-5 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "text-xs font-medium",
              pathname === link.href ? "text-accent" : "text-muted"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
