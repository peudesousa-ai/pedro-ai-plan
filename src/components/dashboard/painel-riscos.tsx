import { AlertTriangle, CalendarX, PauseCircle, PackageX, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Risco {
  id: string;
  titulo: string;
  detalhe: string;
}

const ICONES: Record<string, LucideIcon> = {
  sem_prazo: CalendarX,
  adiantamento: TrendingUp,
  paralisacao: PauseCircle,
  material: PackageX,
};

export function PainelRiscos({ riscos }: { riscos: Risco[] }) {
  if (riscos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum risco aberto no momento.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {riscos.map((risco) => {
        const Icone = ICONES[risco.id] ?? AlertTriangle;
        return (
          <li key={risco.id} className="flex items-start gap-3">
            <span className="mt-0.5 rounded-md bg-alerta-fundo p-1.5 text-alerta-foreground">
              <Icone className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{risco.titulo}</p>
              <p className="text-xs leading-snug text-muted-foreground">{risco.detalhe}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
