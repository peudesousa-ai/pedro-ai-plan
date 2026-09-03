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
import { FaixaEstatisticas } from "@/components/ui/faixa-estatisticas";
import { CabecalhoPagina } from "@/components/ui/cabecalho-pagina";
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
      <CabecalhoPagina
        titulo="Pagamentos"
        descricao="Mão de obra e aditivos pagos ao pedreiro"
        acao={ehAdmin ? <NovoPagamento /> : undefined}
      />

      <FaixaEstatisticas
        itens={[
          { rotulo: "Total pago", valor: formatarBRL(total) },
          {
            rotulo: "Média semanal",
            valor: formatarBRL(media),
            detalhe: "últimas 8 semanas",
          },
          { rotulo: "Lançamentos", valor: String(pagamentos.length) },
        ]}
      />

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
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Observação</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="hidden sm:inline">Comprovante</span>
                  <span className="sm:hidden">Anexo</span>
                </TableHead>
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
                    <TableCell className="whitespace-nowrap py-3 pl-4 tabular-nums">
                      {formatarData(pagamento.data)}
                      {pagamento.tipo === "aditivo" && (
                        <Badge variant="secondary" className="ml-2 sm:hidden">
                          aditivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                      {formatarBRL(pagamento.valor_centavos)}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      {pagamento.tipo === "aditivo" ? (
                        <Badge variant="secondary">aditivo</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">mão de obra</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate text-xs text-muted-foreground md:table-cell">
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
