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
    <nav className="nao-imprimir fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:inset-y-0 lg:left-0 lg:right-auto lg:w-56 lg:border-r lg:border-t-0 lg:pb-0">
      <div className="flex justify-around lg:mt-20 lg:flex-col lg:justify-start lg:gap-1 lg:px-3">
        {itens.map(({ href, rotulo, icone: Icone }) => {
          const ativo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors lg:flex-row lg:gap-3 lg:rounded-md lg:px-3 lg:text-sm",
                ativo
                  ? "text-primary lg:bg-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icone className="h-5 w-5" />
              {rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
