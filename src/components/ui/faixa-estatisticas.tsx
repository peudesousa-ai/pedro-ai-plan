import { Card } from "@/components/ui/card";

export interface ItemEstatistica {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

/**
 * Faixa de indicadores num único card com divisores — os valores nunca
 * quebram nem são cortados, mesmo em telas estreitas.
 */
export function FaixaEstatisticas({
  itens,
  className,
}: {
  itens: ItemEstatistica[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex divide-x divide-border/80">
        {itens.map((item) => (
          <div key={item.rotulo} className="min-w-0 flex-1 px-3 py-3.5 sm:px-6 sm:py-4">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground sm:text-[11px] sm:tracking-[0.08em]">
              {item.rotulo}
            </p>
            <p className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums tracking-tight sm:text-xl">
              {item.valor}
            </p>
            {item.detalhe && (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
                {item.detalhe}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
