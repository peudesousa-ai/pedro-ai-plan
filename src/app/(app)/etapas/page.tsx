import type { Metadata } from "next";
import { exigirPerfil } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { avancoFisicoPonderado } from "@/lib/calculos";
import { formatarBRL, formatarPercentual } from "@/lib/formato";
import { NOMES_GRUPOS, type Etapa, type EtapaHistorico, type GrupoEtapa } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ItemEtapa } from "@/components/etapas/item-etapa";
import { NovaEtapa } from "@/components/etapas/nova-etapa";

export const metadata: Metadata = { title: "Etapas" };
export const dynamic = "force-dynamic";

const ORDEM_GRUPOS: GrupoEtapa[] = [
  "fundacao_estrutura",
  "vedacao_cobertura",
  "acabamento",
];

export default async function PaginaEtapas() {
  const perfil = await exigirPerfil();
  const supabase = await criarClienteServidor();

  const [etapasRes, historicoRes, perfisRes] = await Promise.all([
    supabase.from("etapas").select("*").order("ordem"),
    supabase
      .from("etapa_historico")
      .select("*")
      .order("criado_em", { ascending: false }),
    supabase.from("perfis").select("id, nome"),
  ]);

  const etapas = (etapasRes.data ?? []) as Etapa[];
  const historico = (historicoRes.data ?? []) as EtapaHistorico[];
  const nomesAutores = Object.fromEntries(
    (perfisRes.data ?? []).map((p) => [p.id, p.nome])
  );

  const historicoPorEtapa = new Map<string, EtapaHistorico[]>();
  for (const registro of historico) {
    const lista = historicoPorEtapa.get(registro.etapa_id) ?? [];
    lista.push(registro);
    historicoPorEtapa.set(registro.etapa_id, lista);
  }

  const ehAdmin = perfil.papel === "admin";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Etapas</h1>
          <p className="text-sm text-muted-foreground">
            Avanço ponderado: {formatarPercentual(avancoFisicoPonderado(etapas.filter((e) => e.origem === "contrato")))}
          </p>
        </div>
        {ehAdmin && <NovaEtapa />}
      </div>

      {ORDEM_GRUPOS.map((grupo) => {
        const doGrupo = etapas.filter((e) => e.grupo === grupo);
        if (doGrupo.length === 0) return null;
        const totalGrupo = doGrupo.reduce((a, e) => a + e.valor_orcado_centavos, 0);
        return (
          <Card key={grupo}>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-baseline justify-between text-base">
                {NOMES_GRUPOS[grupo]}
                <span className="text-sm font-normal text-muted-foreground">
                  {formatarBRL(totalGrupo)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doGrupo.map((etapa, i) => (
                <div key={etapa.id}>
                  {i > 0 && <Separator />}
                  <ItemEtapa
                    etapa={etapa}
                    historico={historicoPorEtapa.get(etapa.id) ?? []}
                    nomesAutores={nomesAutores}
                    ehAdmin={ehAdmin}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
