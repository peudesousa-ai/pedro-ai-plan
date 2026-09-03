import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { exigirPerfil } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarData } from "@/lib/formato";
import type { Relatorio } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GerarRelatorio } from "@/components/relatorios/gerar-relatorio";
import { ExcluirRelatorio } from "@/components/relatorios/acoes-relatorio";

export const metadata: Metadata = { title: "Relatórios" };
export const dynamic = "force-dynamic";

export default async function PaginaRelatorios() {
  const perfil = await exigirPerfil();
  const supabase = await criarClienteServidor();

  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .order("gerado_em", { ascending: false });
  const relatorios = (data ?? []) as Relatorio[];
  const ehAdmin = perfil.papel === "admin";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Gere o relatório do período e envie o link ao pedreiro para aceite formal.
          </p>
        </div>
        {ehAdmin && <GerarRelatorio />}
      </div>

      {relatorios.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Nenhum relatório gerado ainda.
          </CardContent>
        </Card>
      )}

      {relatorios.map((relatorio) => {
        const periodo = `${formatarData(relatorio.periodo_inicio)} a ${formatarData(relatorio.periodo_fim)}`;
        return (
          <Card key={relatorio.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/relatorios/${relatorio.id}`}
                  className="font-medium hover:underline"
                >
                  {periodo}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Gerado em {formatarData(relatorio.gerado_em.slice(0, 10))}
                </p>
              </div>
              {relatorio.aceito_em ? (
                <Badge variant="ok">
                  aceito por {relatorio.assinatura_nome ?? relatorio.aceito_por}
                </Badge>
              ) : (
                <Badge variant="outline">aguardando aceite</Badge>
              )}
              {ehAdmin && !relatorio.aceito_em && (
                <ExcluirRelatorio relatorioId={relatorio.id} descricao={periodo} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
