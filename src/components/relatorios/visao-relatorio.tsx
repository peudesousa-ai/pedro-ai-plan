import { formatarBRL, formatarData, formatarPercentual } from "@/lib/formato";
import type { SnapshotRelatorio } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="font-medium tabular-nums">{valor}</span>
    </div>
  );
}

/** Renderização do snapshot congelado — usada na tela interna e no link público. */
export function VisaoRelatorio({ snapshot }: { snapshot: SnapshotRelatorio }) {
  const { acumulado } = snapshot;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumo acumulado da obra</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Linha
            rotulo="Contrato de mão de obra"
            valor={formatarBRL(acumulado.valor_contrato_centavos)}
          />
          <Linha
            rotulo="Total pago ao pedreiro"
            valor={`${formatarBRL(acumulado.total_pago_centavos)} (${formatarPercentual(acumulado.avanco_financeiro)})`}
          />
          <Linha
            rotulo="Serviço entregue"
            valor={`${formatarBRL(acumulado.valor_entregue_centavos)} (${formatarPercentual(acumulado.avanco_fisico_ponderado)})`}
          />
          <Linha
            rotulo="Adiantamento (pago − entregue)"
            valor={formatarBRL(acumulado.adiantamento_centavos)}
          />
          <Linha
            rotulo="Saldo a pagar do contrato"
            valor={formatarBRL(acumulado.saldo_a_pagar_centavos)}
          />
          <Linha
            rotulo="Gasto acumulado em material"
            valor={formatarBRL(acumulado.total_materiais_centavos)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Etapas concluídas no período</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshot.etapas_concluidas_no_periodo.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma etapa foi concluída neste período.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {snapshot.etapas_concluidas_no_periodo.map((etapa) => (
                <li
                  key={etapa.nome}
                  className="flex items-baseline justify-between py-1.5 text-sm"
                >
                  <span>{etapa.nome}</span>
                  <span className="font-medium tabular-nums">
                    {formatarBRL(etapa.valor_orcado_centavos)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Etapas em andamento</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshot.etapas_em_andamento.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma etapa em andamento.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {snapshot.etapas_em_andamento.map((etapa) => (
                <li
                  key={etapa.nome}
                  className="flex items-baseline justify-between py-1.5 text-sm"
                >
                  <span>{etapa.nome}</span>
                  <span className="font-medium tabular-nums">
                    {etapa.percentual_concluido}% de{" "}
                    {formatarBRL(etapa.valor_orcado_centavos)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pagamentos no período</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="pr-4 text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.pagamentos_no_periodo.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="p-4 text-center text-muted-foreground">
                    Nenhum pagamento no período.
                  </TableCell>
                </TableRow>
              )}
              {snapshot.pagamentos_no_periodo.map((pagamento, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4 tabular-nums">
                    {formatarData(pagamento.data)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {pagamento.tipo === "aditivo" ? "aditivo" : "mão de obra"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap pr-4 text-right font-medium tabular-nums">
                    {formatarBRL(pagamento.valor_centavos)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {snapshot.pagamentos_no_periodo.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="pl-4">
                    Total do período
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">
                    {formatarBRL(snapshot.total_pago_periodo_centavos)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Materiais comprados no período</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshot.materiais_no_periodo.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma compra de material registrada no período.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {snapshot.materiais_no_periodo.map((material, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between py-1.5 text-sm"
                >
                  <span>
                    <span className="tabular-nums">{formatarData(material.data)}</span> ·{" "}
                    {material.descricao}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatarBRL(material.valor_centavos)}
                  </span>
                </li>
              ))}
              <li className="flex items-baseline justify-between py-1.5 text-sm font-medium">
                <span>Total do período</span>
                <span className="tabular-nums">
                  {formatarBRL(snapshot.total_materiais_periodo_centavos)}
                </span>
              </li>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
