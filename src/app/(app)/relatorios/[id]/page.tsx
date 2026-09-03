import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirPerfil } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarData } from "@/lib/formato";
import type { Relatorio } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { VisaoRelatorio } from "@/components/relatorios/visao-relatorio";
import {
  BotaoImprimir,
  CopiarLinkAceite,
} from "@/components/relatorios/acoes-relatorio";

export const metadata: Metadata = { title: "Relatório" };
export const dynamic = "force-dynamic";

export default async function PaginaRelatorio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfil = await exigirPerfil();
  const supabase = await criarClienteServidor();

  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const relatorio = data as Relatorio;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Relatório · {formatarData(relatorio.periodo_inicio)} a{" "}
            {formatarData(relatorio.periodo_fim)}
          </h1>
          <p className="text-xs text-muted-foreground">
            Gerado em {formatarData(relatorio.gerado_em.slice(0, 10))}
          </p>
        </div>
        <div className="nao-imprimir flex flex-wrap items-center gap-2">
          <BotaoImprimir />
          {perfil.papel === "admin" && !relatorio.aceito_em && (
            <CopiarLinkAceite token={relatorio.token_publico} />
          )}
        </div>
      </div>

      {relatorio.aceito_em ? (
        <Badge variant="ok" className="self-start">
          Aceito em {formatarData(relatorio.aceito_em.slice(0, 10))} por{" "}
          {relatorio.assinatura_nome ?? relatorio.aceito_por}
        </Badge>
      ) : (
        <Badge variant="outline" className="self-start">
          Aguardando aceite do pedreiro
        </Badge>
      )}

      <VisaoRelatorio snapshot={relatorio.snapshot} />
    </div>
  );
}
