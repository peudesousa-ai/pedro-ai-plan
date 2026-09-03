/**
 * Cálculos financeiros da obra. Funções puras — testadas em calculos.test.ts
 * com os números reais do briefing, para que um erro aqui não passe despercebido.
 *
 * Todos os valores em centavos.
 */
import type { Etapa, Pagamento } from "@/lib/types";

type EtapaCalculo = Pick<Etapa, "valor_orcado_centavos" | "percentual_concluido">;
type PagamentoCalculo = Pick<Pagamento, "data" | "valor_centavos">;

/** Σ(valor × %concluído) — quanto de serviço já foi entregue, em centavos. */
export function valorEntregueCentavos(etapas: EtapaCalculo[]): number {
  return Math.round(
    etapas.reduce(
      (acc, e) => acc + (e.valor_orcado_centavos * e.percentual_concluido) / 100,
      0
    )
  );
}

/**
 * Avanço físico ponderado pelo valor da etapa (0–100):
 * Σ(valor × %) / Σ(valor). É o número que manda — a contagem simples
 * de etapas concluídas ignora que as etapas têm pesos diferentes.
 */
export function avancoFisicoPonderado(etapas: EtapaCalculo[]): number {
  const total = etapas.reduce((acc, e) => acc + e.valor_orcado_centavos, 0);
  if (total === 0) return 0;
  return (valorEntregueCentavos(etapas) / total) * 100;
}

/** Contagem simples: % de etapas 100% concluídas (exibida como referência). */
export function avancoPorContagem(etapas: EtapaCalculo[]): number {
  if (etapas.length === 0) return 0;
  const concluidas = etapas.filter((e) => e.percentual_concluido === 100).length;
  return (concluidas / etapas.length) * 100;
}

/**
 * Adiantamento ao pedreiro: total pago − serviço entregue.
 * Positivo = a obra deve serviço; é o número mais importante do sistema.
 */
export function adiantamentoCentavos(
  totalPagoCentavos: number,
  etapas: EtapaCalculo[]
): number {
  return totalPagoCentavos - valorEntregueCentavos(etapas);
}

/** Avanço financeiro (0–100): quanto do contrato já foi pago. */
export function avancoFinanceiro(
  totalPagoCentavos: number,
  valorContratoCentavos: number
): number {
  if (valorContratoCentavos === 0) return 0;
  return (totalPagoCentavos / valorContratoCentavos) * 100;
}

export function totalPagoCentavos(pagamentos: PagamentoCalculo[]): number {
  return pagamentos.reduce((acc, p) => acc + p.valor_centavos, 0);
}

/**
 * Média semanal de desembolso, em centavos, sobre os últimos `n` pagamentos
 * (o pagamento é semanal, então cada lançamento ≈ uma semana).
 */
export function mediaSemanalCentavos(
  pagamentos: PagamentoCalculo[],
  n = 8
): number {
  if (pagamentos.length === 0) return 0;
  const ordenados = [...pagamentos].sort((a, b) => a.data.localeCompare(b.data));
  const ultimos = ordenados.slice(-n);
  return Math.round(totalPagoCentavos(ultimos) / ultimos.length);
}

/**
 * Quantas semanas o saldo restante ainda cobre no ritmo médio.
 * Retorna null quando não há ritmo (nenhum pagamento).
 */
export function projecaoSemanasRestantes(
  saldoCentavos: number,
  mediaSemanal: number
): number | null {
  if (mediaSemanal <= 0) return null;
  if (saldoCentavos <= 0) return 0;
  return saldoCentavos / mediaSemanal;
}

export interface IntervaloSemPagamento {
  ultimoPagamento: string;
  proximoPagamento: string;
  dias: number;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function diasEntre(inicioIso: string, fimIso: string): number {
  // datas `date` sem timezone: interpretar como UTC evita erro de fuso
  return Math.round(
    (Date.parse(`${fimIso}T00:00:00Z`) - Date.parse(`${inicioIso}T00:00:00Z`)) / MS_POR_DIA
  );
}

/**
 * Intervalos entre pagamentos consecutivos maiores que `limiteDias`
 * (padrão 9: pagamento é semanal, 9 dias absorve feriado que desloca a data).
 * Detecta a paralisação de agosto/2026 e qualquer outra.
 */
export function semanasSemPagamento(
  pagamentos: PagamentoCalculo[],
  limiteDias = 9
): IntervaloSemPagamento[] {
  const datas = [...new Set(pagamentos.map((p) => p.data))].sort();
  const intervalos: IntervaloSemPagamento[] = [];
  for (let i = 1; i < datas.length; i++) {
    const dias = diasEntre(datas[i - 1], datas[i]);
    if (dias > limiteDias) {
      intervalos.push({
        ultimoPagamento: datas[i - 1],
        proximoPagamento: datas[i],
        dias,
      });
    }
  }
  return intervalos;
}

/** Dias desde o último pagamento até `hojeIso` (null sem pagamentos). */
export function diasDesdeUltimoPagamento(
  pagamentos: PagamentoCalculo[],
  hojeIso: string
): number | null {
  if (pagamentos.length === 0) return null;
  const ultima = pagamentos.map((p) => p.data).sort().at(-1)!;
  return diasEntre(ultima, hojeIso);
}

export interface PontoCurva {
  data: string;
  acumuladoCentavos: number;
}

/** Curva de desembolso acumulado (um ponto por data de pagamento). */
export function curvaDesembolso(pagamentos: PagamentoCalculo[]): PontoCurva[] {
  const ordenados = [...pagamentos].sort((a, b) => a.data.localeCompare(b.data));
  const pontos: PontoCurva[] = [];
  let acumulado = 0;
  for (const p of ordenados) {
    acumulado += p.valor_centavos;
    const anterior = pontos.at(-1);
    if (anterior && anterior.data === p.data) {
      anterior.acumuladoCentavos = acumulado;
    } else {
      pontos.push({ data: p.data, acumuladoCentavos: acumulado });
    }
  }
  return pontos;
}

export type StatusEtapa = "nao_iniciada" | "em_andamento" | "concluida";

export function statusEtapa(percentual: number): StatusEtapa {
  if (percentual === 0) return "nao_iniciada";
  if (percentual === 100) return "concluida";
  return "em_andamento";
}
