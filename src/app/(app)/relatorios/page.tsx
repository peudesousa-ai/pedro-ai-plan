import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { exigirPerfil } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarData } from "@/lib/formato";
import type { Relatorio } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CabecalhoPagina } from "@/components/ui/cabecalho-pagina";
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
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Gere o relatório do período e envie o link ao pedreiro para aceite formal."
        acao={ehAdmin ? <GerarRelatorio /> : undefined}
      />

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
          <Card key={relatorio.id} className="hover:shadow-md">
            <CardContent className="flex items-start gap-3 p-4">
              <span className="mt-0.5 shrink-0 rounded-lg bg-accent p-2 text-accent-foreground">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Link
                  href={`/relatorios/${relatorio.id}`}
                  className="font-medium leading-tight transition-colors duration-200 hover:text-primary hover:underline"
                >
                  {periodo}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Gerado em {formatarData(relatorio.gerado_em.slice(0, 10))}
                </p>
                <div className="mt-0.5">
                  {relatorio.aceito_em ? (
                    <Badge variant="ok">
                      aceito por {relatorio.assinatura_nome ?? relatorio.aceito_por}
                    </Badge>
                  ) : (
                    <Badge variant="outline">aguardando aceite</Badge>
                  )}
                </div>
              </div>
              {ehAdmin && !relatorio.aceito_em && (
                <div className="shrink-0">
                  <ExcluirRelatorio relatorioId={relatorio.id} descricao={periodo} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
