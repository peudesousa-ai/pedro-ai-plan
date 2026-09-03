import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { formatarData } from "@/lib/formato";
import type { Relatorio } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { VisaoRelatorio } from "@/components/relatorios/visao-relatorio";
import { FormularioAceite } from "@/components/relatorios/formulario-aceite";

export const metadata: Metadata = {
  title: "Conferência de relatório",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Página pública de conferência e aceite — o pedreiro acessa pelo link com
 * token, sem login. A busca usa service role no servidor; a RLS segue fechada.
 */
export default async function PaginaAceite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!UUID.test(token)) notFound();

  const supabase = criarClienteAdmin();
  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .eq("token_publico", token)
    .maybeSingle();
  if (!data) notFound();
  const relatorio = data as Relatorio;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Obra Lagoa Santa
        </p>
        <h1 className="text-xl font-semibold">
          Relatório de {formatarData(relatorio.periodo_inicio)} a{" "}
          {formatarData(relatorio.periodo_fim)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerado em {formatarData(relatorio.gerado_em.slice(0, 10))}. Confira os
          números abaixo{relatorio.aceito_em ? "." : " e confirme no final da página."}
        </p>
      </header>

      {relatorio.aceito_em && (
        <Card className="border-ok bg-ok-fundo">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-ok" />
            <p className="text-sm">
              Aceito em {formatarData(relatorio.aceito_em.slice(0, 10))} por{" "}
              <span className="font-medium">
                {relatorio.assinatura_nome ?? relatorio.aceito_por}
              </span>
              . Este registro é imutável.
            </p>
          </CardContent>
        </Card>
      )}

      <VisaoRelatorio snapshot={relatorio.snapshot} />

      {!relatorio.aceito_em && <FormularioAceite token={token} />}
    </main>
  );
}
