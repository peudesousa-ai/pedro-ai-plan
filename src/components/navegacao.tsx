"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  Package,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const itens = [
  { href: "/dashboard", rotulo: "Resumo", icone: LayoutDashboard },
  { href: "/etapas", rotulo: "Etapas", icone: ListChecks },
  { href: "/pagamentos", rotulo: "Pagamentos", icone: Wallet },
  { href: "/materiais", rotulo: "Materiais", icone: Package },
  { href: "/relatorios", rotulo: "Relatórios", icone: FileText },
];

/** Barra inferior no celular, lateral esquerda no desktop. */
export function Navegacao() {
  const pathname = usePathname();

  return (
    <nav className="nao-imprimir fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:inset-y-0 lg:left-0 lg:right-auto lg:w-56 lg:border-r lg:border-t-0 lg:bg-card lg:pb-0 lg:backdrop-blur-none">
      <div className="flex justify-around lg:mt-20 lg:flex-col lg:justify-start lg:gap-1.5 lg:px-3">
        {itens.map(({ href, rotulo, icone: Icone }) => {
          const ativo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-all duration-200 lg:flex-row lg:gap-3 lg:rounded-lg lg:px-3.5 lg:py-2.5 lg:text-sm",
                ativo
                  ? "text-primary lg:bg-primary/10 lg:font-medium"
                  : "text-muted-foreground hover:text-foreground lg:hover:bg-accent/70 lg:hover:translate-x-0.5"
              )}
            >
              {ativo && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary lg:inset-x-auto lg:inset-y-2 lg:left-0 lg:top-2 lg:h-auto lg:w-0.5"
                />
              )}
              <Icone
                className={cn("h-5 w-5 transition-transform duration-200", ativo && "scale-105")}
                strokeWidth={ativo ? 2.2 : 1.8}
              />
              {rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
