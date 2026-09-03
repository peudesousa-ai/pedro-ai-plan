import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buscarDadosObra } from "@/lib/dados";
import {
  adiantamentoCentavos,
  avancoFinanceiro,
  avancoFisicoPonderado,
  avancoPorContagem,
  curvaDesembolso,
  diasDesdeUltimoPagamento,
  mediaSemanalCentavos,
  projecaoSemanasRestantes,
  semanasSemPagamento,
  totalPagoCentavos,
  valorEntregueCentavos,
} from "@/lib/calculos";
import {
  formatarBRL,
  formatarData,
  formatarPercentual,
  hojeIso,
} from "@/lib/formato";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ComparativoAvanco } from "@/components/dashboard/comparativo-avanco";
import { GraficoCurvaDesembolso } from "@/components/dashboard/curva-desembolso";
import { PainelRiscos, type Risco } from "@/components/dashboard/painel-riscos";

export const metadata: Metadata = { title: "Resumo" };
export const dynamic = "force-dynamic";

function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
}) {
  return (
    <Card className="hover:shadow-md">
      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        {/* altura de duas linhas garante que os valores alinhem entre os cards */}
        <p className="min-h-[2.2em] text-[10px] font-medium uppercase leading-tight tracking-[0.06em] text-muted-foreground sm:text-[11px] sm:tracking-[0.08em]">
          {rotulo}
        </p>
        <p className="whitespace-nowrap pt-1 text-lg font-semibold tabular-nums tracking-tight sm:text-2xl">
          {valor}
        </p>
        {detalhe && (
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
            {detalhe}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function PaginaDashboard() {
  const { etapas, pagamentos, materiais, configuracoes } = await buscarDadosObra();
  const hoje = hojeIso();

  const etapasContrato = etapas.filter((e) => e.origem === "contrato");
  const etapasAditivo = etapas.filter((e) => e.origem === "aditivo");
  const pagamentosMaoDeObra = pagamentos.filter((p) => p.tipo === "mao_de_obra");

  const valorContrato = configuracoes.valor_contrato_centavos;
  const totalPago = totalPagoCentavos(pagamentosMaoDeObra);
  const entregue = valorEntregueCentavos(etapasContrato);
  const adiantamento = adiantamentoCentavos(totalPago, etapasContrato);
  const avancoFisico = avancoFisicoPonderado(etapasContrato);
  const avancoContagem = avancoPorContagem(etapasContrato);
  const avancoFin = avancoFinanceiro(totalPago, valorContrato);
  const saldo = valorContrato - totalPago;

  const totalMateriais = materiais
    .filter((m) => m.status === "comprado")
    .reduce((acc, m) => acc + (m.valor_centavos ?? 0), 0);
  const materiaisComprados = materiais.filter((m) => m.status === "comprado").length;

  const media = mediaSemanalCentavos(pagamentosMaoDeObra);
  const semanasRestantes = projecaoSemanasRestantes(saldo, media);
  const pontosCurva = curvaDesembolso(pagamentosMaoDeObra);

  const diasSemPagar = diasDesdeUltimoPagamento(pagamentosMaoDeObra, hoje);
  const paralisacoes = semanasSemPagamento(pagamentosMaoDeObra);
  const ultimaParalisacao = paralisacoes.at(-1);

  const emAndamento = etapas.filter(
    (e) => e.percentual_concluido > 0 && e.percentual_concluido < 100
  );

  // ---- Riscos abertos ----
  const riscos: Risco[] = [];
  if (!configuracoes.data_alvo) {
    riscos.push({
      id: "sem_prazo",
      titulo: "Sem prazo de entrega acordado",
      detalhe:
        "Não existe data-alvo combinada com o pedreiro. Cadastre uma quando for acordada.",
    });
  }
  if (adiantamento > 0) {
    riscos.push({
      id: "adiantamento",
      titulo: "Pagamento desvinculado de entrega",
      detalhe: `O pagamento semanal fixo já colocou ${formatarBRL(adiantamento)} à frente do serviço entregue.`,
    });
  }
  if (diasSemPagar !== null && diasSemPagar > 9) {
    riscos.push({
      id: "paralisacao",
      titulo: `Sem pagamento há ${diasSemPagar} dias`,
      detalhe: "Ritmo semanal interrompido — verifique se a obra está parada.",
    });
  } else if (ultimaParalisacao && ultimaParalisacao.dias >= 14) {
    riscos.push({
      id: "paralisacao",
      titulo: "Paralisação recente",
      detalhe: `A obra ficou ${ultimaParalisacao.dias} dias sem pagamento entre ${formatarData(ultimaParalisacao.ultimoPagamento)} e ${formatarData(ultimaParalisacao.proximoPagamento)}.`,
    });
  }
  if (materiaisComprados <= 3) {
    riscos.push({
      id: "material",
      titulo: "Gasto com material quase sem registro",
      detalhe:
        "As compras de material ainda não estão mapeadas. Lance as notas na tela de Materiais.",
    });
  }

  const adiantamentoPositivo = adiantamento > 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      {/* Destaque: adiantamento */}
      <Card
        className={
          adiantamentoPositivo ? "border-alerta bg-alerta-fundo" : "border-ok bg-ok-fundo"
        }
      >
        <CardContent className="p-5 sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Adiantamento ao pedreiro
          </p>
          <p
            className={`mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl ${
              adiantamentoPositivo ? "text-alerta-foreground" : "text-ok"
            }`}
          >
            {formatarBRL(adiantamento)}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {adiantamentoPositivo
              ? "Valor já pago que ainda não virou serviço entregue — quanto maior, maior o risco se a obra parar."
              : "O serviço entregue está à frente do valor pago — sem adiantamento em aberto."}
          </p>
        </CardContent>
      </Card>

      {/* Cards de indicadores */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <CartaoIndicador rotulo="Orçamento contratado" valor={formatarBRL(valorContrato)} />
        <CartaoIndicador
          rotulo="Pago ao pedreiro"
          valor={formatarBRL(totalPago)}
          detalhe={`${formatarPercentual(avancoFin)} do contrato`}
        />
        <CartaoIndicador rotulo="Saldo a pagar" valor={formatarBRL(saldo)} />
        <CartaoIndicador
          rotulo="Avanço físico"
          valor={formatarPercentual(avancoFisico)}
          detalhe={`ponderado pelo valor · contagem simples: ${formatarPercentual(avancoContagem)}`}
        />
        <CartaoIndicador rotulo="Gasto em material" valor={formatarBRL(totalMateriais)} />
        <CartaoIndicador
          rotulo="Desembolso total"
          valor={formatarBRL(totalPago + totalMateriais)}
          detalhe="mão de obra + material"
        />
      </div>

      {etapasAditivo.length > 0 && (
        <Card>
          <CardContent className="p-4 text-sm">
            <Badge variant="secondary" className="mr-2">
              Aditivos
            </Badge>
            {etapasAditivo.length} etapa(s) fora do contrato original, somando{" "}
            {formatarBRL(etapasAditivo.reduce((a, e) => a + e.valor_orcado_centavos, 0))}.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Avanço físico × financeiro */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Entregue × pago</CardTitle>
            <p className="text-xs text-muted-foreground">
              As duas barras na mesma escala do contrato — a diferença entre elas é o adiantamento.
            </p>
          </CardHeader>
          <CardContent>
            <ComparativoAvanco avancoFisico={avancoFisico} avancoFinanceiro={avancoFin} />
            <p className="mt-4 text-xs text-muted-foreground">
              Serviço entregue: {formatarBRL(entregue)} · Pago: {formatarBRL(totalPago)}
            </p>
          </CardContent>
        </Card>

        {/* Riscos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Riscos abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <PainelRiscos riscos={riscos} />
          </CardContent>
        </Card>
      </div>

      {/* Curva de desembolso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Desembolso acumulado</CardTitle>
          <p className="text-xs text-muted-foreground">
            Pagamentos de mão de obra somados ao longo do tempo, em reais.
          </p>
        </CardHeader>
        <CardContent>
          <GraficoCurvaDesembolso pontos={pontosCurva} />
          <p className="mt-3 text-sm">
            {semanasRestantes !== null ? (
              <>
                No ritmo médio de {formatarBRL(media)}/semana, o saldo de{" "}
                {formatarBRL(saldo)} cobre aproximadamente{" "}
                <span className="font-semibold">
                  {Math.floor(semanasRestantes)} semanas
                </span>{" "}
                de obra.
              </>
            ) : (
              "Sem pagamentos registrados para estimar o ritmo."
            )}
          </p>
        </CardContent>
      </Card>

      {/* Etapas em andamento */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Etapas em andamento</CardTitle>
          <Link
            href="/etapas"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {emAndamento.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma etapa em andamento.</p>
          )}
          {emAndamento.map((etapa) => (
            <div key={etapa.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">{etapa.nome}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {etapa.percentual_concluido}%
                </span>
              </div>
              <Progress value={etapa.percentual_concluido} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
