import { formatarPercentual } from "@/lib/formato";

const COR_FISICO = "#2a78d6";
const COR_FINANCEIRO = "#eb6834";

function Barra({
  rotulo,
  percentual,
  cor,
}: {
  rotulo: string;
  percentual: number;
  cor: string;
}) {
  const limitado = Math.max(0, Math.min(100, percentual));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: cor }}
          />
          {rotulo}
        </span>
        <span className="font-semibold tabular-nums">{formatarPercentual(percentual)}</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(limitado)}
        aria-label={rotulo}
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-r-full"
          style={{ width: `${limitado}%`, backgroundColor: cor }}
        />
      </div>
    </div>
  );
}

/**
 * Compara avanço físico (serviço entregue) e financeiro (pago) na mesma
 * escala de 0 a 100% do contrato. A distância entre as duas barras É o
 * adiantamento.
 */
export function ComparativoAvanco({
  avancoFisico,
  avancoFinanceiro,
}: {
  avancoFisico: number;
  avancoFinanceiro: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Barra rotulo="Serviço entregue" percentual={avancoFisico} cor={COR_FISICO} />
      <Barra rotulo="Valor pago" percentual={avancoFinanceiro} cor={COR_FINANCEIRO} />
    </div>
  );
}
