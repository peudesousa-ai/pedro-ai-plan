"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/sessao";
import {
  adiantamentoCentavos,
  avancoFinanceiro,
  avancoFisicoPonderado,
  totalPagoCentavos,
  valorEntregueCentavos,
} from "@/lib/calculos";
import type {
  Configuracoes,
  Etapa,
  Material,
  Pagamento,
  SnapshotRelatorio,
} from "@/lib/types";

export interface ResultadoAcao {
  erro: string | null;
}

/**
 * Gera o relatório do período: congela um snapshot com os números do momento.
 * O snapshot é o que o pedreiro confere e aceita — depois do aceite, o banco
 * o torna imutável.
 */
export async function gerarRelatorio(
  periodoInicio: string,
  periodoFim: string
): Promise<ResultadoAcao> {
  const perfil = await exigirAdmin();
  const supabase = await criarClienteServidor();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(periodoInicio) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodoFim) ||
    periodoFim < periodoInicio
  ) {
    return { erro: "Período inválido." };
  }

  const [etapasRes, pagamentosRes, materiaisRes, configRes] = await Promise.all([
    supabase.from("etapas").select("*").order("ordem"),
    supabase.from("pagamentos").select("*").order("data"),
    supabase.from("materiais").select("*").eq("status", "comprado"),
    supabase.from("configuracoes").select("*").maybeSingle(),
  ]);
  const erroBusca =
    etapasRes.error ?? pagamentosRes.error ?? materiaisRes.error ?? configRes.error;
  if (erroBusca) return { erro: `Erro ao carregar dados: ${erroBusca.message}` };

  const etapas = (etapasRes.data ?? []) as Etapa[];
  const pagamentos = (pagamentosRes.data ?? []) as Pagamento[];
  const materiais = (materiaisRes.data ?? []) as Material[];
  const config = (configRes.data ?? { valor_contrato_centavos: 0 }) as Configuracoes;

  const etapasContrato = etapas.filter((e) => e.origem === "contrato");
  const pagamentosMaoDeObra = pagamentos.filter((p) => p.tipo === "mao_de_obra");

  const noPeriodo = (data: string | null) =>
    data !== null && data >= periodoInicio && data <= periodoFim;

  const pagamentosPeriodo = pagamentos.filter((p) => noPeriodo(p.data));
  const materiaisPeriodo = materiais.filter((m) => noPeriodo(m.data));

  const totalPago = totalPagoCentavos(pagamentosMaoDeObra);
  const entregue = valorEntregueCentavos(etapasContrato);

  const snapshot: SnapshotRelatorio = {
    periodo_inicio: periodoInicio,
    periodo_fim: periodoFim,
    etapas_concluidas_no_periodo: etapas
      .filter((e) => e.percentual_concluido === 100 && noPeriodo(e.data_conclusao))
      .map((e) => ({ nome: e.nome, valor_orcado_centavos: e.valor_orcado_centavos })),
    etapas_em_andamento: etapas
      .filter((e) => e.percentual_concluido > 0 && e.percentual_concluido < 100)
      .map((e) => ({
        nome: e.nome,
        percentual_concluido: e.percentual_concluido,
        valor_orcado_centavos: e.valor_orcado_centavos,
      })),
    pagamentos_no_periodo: pagamentosPeriodo.map((p) => ({
      data: p.data,
      valor_centavos: p.valor_centavos,
      tipo: p.tipo,
    })),
    materiais_no_periodo: materiaisPeriodo.map((m) => ({
      data: m.data!,
      descricao: m.descricao,
      valor_centavos: m.valor_centavos ?? 0,
    })),
    total_pago_periodo_centavos: totalPagoCentavos(pagamentosPeriodo),
    total_materiais_periodo_centavos: materiaisPeriodo.reduce(
      (acc, m) => acc + (m.valor_centavos ?? 0),
      0
    ),
    acumulado: {
      valor_contrato_centavos: config.valor_contrato_centavos,
      total_pago_centavos: totalPago,
      valor_entregue_centavos: entregue,
      adiantamento_centavos: adiantamentoCentavos(totalPago, etapasContrato),
      avanco_fisico_ponderado: avancoFisicoPonderado(etapasContrato),
      avanco_financeiro: avancoFinanceiro(totalPago, config.valor_contrato_centavos),
      saldo_a_pagar_centavos: config.valor_contrato_centavos - totalPago,
      total_materiais_centavos: materiais.reduce(
        (acc, m) => acc + (m.valor_centavos ?? 0),
        0
      ),
    },
  };

  const { error } = await supabase.from("relatorios").insert({
    periodo_inicio: periodoInicio,
    periodo_fim: periodoFim,
    snapshot,
    gerado_por: perfil.id,
  });
  if (error) return { erro: `Não foi possível gerar: ${error.message}` };

  revalidatePath("/relatorios");
  return { erro: null };
}

/** Exclui um relatório ainda não aceito (o banco bloqueia excluir aceito). */
export async function excluirRelatorio(relatorioId: string): Promise<ResultadoAcao> {
  await exigirAdmin();
  const supabase = await criarClienteServidor();

  const { error } = await supabase.from("relatorios").delete().eq("id", relatorioId);
  if (error) {
    return {
      erro: error.message.includes("imutável")
        ? "Relatório aceito não pode ser excluído."
        : `Não foi possível excluir: ${error.message}`,
    };
  }

  revalidatePath("/relatorios");
  return { erro: null };
}
