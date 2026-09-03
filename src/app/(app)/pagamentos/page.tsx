import type { Metadata } from "next";
import { Paperclip } from "lucide-react";
import { exigirPerfil } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import {
  mediaSemanalCentavos,
  semanasSemPagamento,
  totalPagoCentavos,
} from "@/lib/calculos";
import { formatarBRL, formatarData } from "@/lib/formato";
import type { Pagamento } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovoPagamento } from "@/components/pagamentos/novo-pagamento";
import { ExcluirPagamento } from "@/components/pagamentos/excluir-pagamento";

export const metadata: Metadata = { title: "Pagamentos" };
export const dynamic = "force-dynamic";

export default async function PaginaPagamentos() {
  const perfil = await exigirPerfil();
  const supabase = await criarClienteServidor();

  const { data } = await supabase
    .from("pagamentos")
    .select("*")
    .order("data", { ascending: false });
  const pagamentos = (data ?? []) as Pagamento[];

  // signed URLs (1h) para os comprovantes anexados
  const paths = pagamentos
    .map((p) => p.comprovante_path)
    .filter((p): p is string => p !== null);
  const urlsAssinadas = new Map<string, string>();
  if (paths.length > 0) {
    const { data: assinadas } = await supabase.storage
      .from("comprovantes")
      .createSignedUrls(paths, 3600);
    for (const item of assinadas ?? []) {
      if (item.signedUrl && item.path) urlsAssinadas.set(item.path, item.signedUrl);
    }
  }

  const total = totalPagoCentavos(pagamentos);
  const media = mediaSemanalCentavos(pagamentos);
  const intervalos = semanasSemPagamento(pagamentos);
  const ehAdmin = perfil.papel === "admin";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Pagamentos ao pedreiro</h1>
        {ehAdmin && <NovoPagamento />}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total pago
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
              {formatarBRL(total)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Média semanal
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
              {formatarBRL(media)}
            </p>
            <p className="text-xs text-muted-foreground">últimas 8 semanas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lançamentos
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
              {pagamentos.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {intervalos.length > 0 && (
        <Card className="border-alerta bg-alerta-fundo">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Semanas sem pagamento detectadas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-alerta-foreground">
            {intervalos.map((intervalo) => (
              <p key={intervalo.ultimoPagamento}>
                {intervalo.dias} dias entre {formatarData(intervalo.ultimoPagamento)} e{" "}
                {formatarData(intervalo.proximoPagamento)}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Observação</TableHead>
                <TableHead className="pr-4 text-right">Comprovante</TableHead>
                {ehAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-4 text-center text-muted-foreground">
                    Nenhum pagamento lançado.
                  </TableCell>
                </TableRow>
              )}
              {pagamentos.map((pagamento) => {
                const url = pagamento.comprovante_path
                  ? urlsAssinadas.get(pagamento.comprovante_path)
                  : undefined;
                return (
                  <TableRow key={pagamento.id}>
                    <TableCell className="whitespace-nowrap pl-4 tabular-nums">
                      {formatarData(pagamento.data)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatarBRL(pagamento.valor_centavos)}
                    </TableCell>
                    <TableCell>
                      {pagamento.tipo === "aditivo" ? (
                        <Badge variant="secondary">aditivo</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">mão de obra</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate text-xs text-muted-foreground sm:table-cell">
                      {pagamento.observacao}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" /> ver
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {ehAdmin && (
                      <TableCell className="pr-2 text-right">
                        <ExcluirPagamento
                          pagamentoId={pagamento.id}
                          descricao={`${formatarData(pagamento.data)} · ${formatarBRL(pagamento.valor_centavos)}`}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
