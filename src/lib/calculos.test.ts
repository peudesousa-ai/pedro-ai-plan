import { describe, expect, it } from "vitest";
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
  statusEtapa,
  totalPagoCentavos,
  valorEntregueCentavos,
} from "./calculos";

// Os dados reais do briefing (setembro/2026), em centavos.
const ETAPAS = [
  { valor_orcado_centavos: 400000, percentual_concluido: 100 }, // Tubulões + sapata
  { valor_orcado_centavos: 460000, percentual_concluido: 100 }, // Blocos alicerce
  { valor_orcado_centavos: 400000, percentual_concluido: 100 }, // Cintamento baixo
  { valor_orcado_centavos: 220500, percentual_concluido: 90 }, // Piso grosso
  { valor_orcado_centavos: 500000, percentual_concluido: 100 }, // Paredes
  { valor_orcado_centavos: 315000, percentual_concluido: 100 }, // Pilares
  { valor_orcado_centavos: 460000, percentual_concluido: 100 }, // Cintamento superior
  { valor_orcado_centavos: 321000, percentual_concluido: 100 }, // Laje
  { valor_orcado_centavos: 600000, percentual_concluido: 50 }, // Reboco externo
  { valor_orcado_centavos: 306000, percentual_concluido: 100 }, // Emboço
  { valor_orcado_centavos: 300000, percentual_concluido: 0 }, // Telhado varanda
  { valor_orcado_centavos: 300000, percentual_concluido: 30 }, // Contrapiso
  { valor_orcado_centavos: 500000, percentual_concluido: 0 }, // Cerâmica
  { valor_orcado_centavos: 150000, percentual_concluido: 0 }, // Bancada
  { valor_orcado_centavos: 150000, percentual_concluido: 0 }, // Louças
  { valor_orcado_centavos: 350000, percentual_concluido: 0 }, // Elétrica
  { valor_orcado_centavos: 350000, percentual_concluido: 30 }, // Hidráulica
  { valor_orcado_centavos: 700000, percentual_concluido: 0 }, // Gesso liso
  { valor_orcado_centavos: 150000, percentual_concluido: 0 }, // Marcos de porta
  { valor_orcado_centavos: 250000, percentual_concluido: 0 }, // Pintura
];

const PAGAMENTOS = [
  { data: "2026-03-06", valor_centavos: 200000 },
  { data: "2026-03-13", valor_centavos: 80000 },
  { data: "2026-03-20", valor_centavos: 40000 },
  { data: "2026-04-03", valor_centavos: 400000 },
  { data: "2026-04-10", valor_centavos: 350000 },
  { data: "2026-04-17", valor_centavos: 210500 },
  { data: "2026-04-24", valor_centavos: 320000 },
  { data: "2026-05-01", valor_centavos: 230000 },
  { data: "2026-05-08", valor_centavos: 250000 },
  { data: "2026-05-22", valor_centavos: 220000 },
  { data: "2026-05-29", valor_centavos: 220000 },
  { data: "2026-06-05", valor_centavos: 220000 },
  { data: "2026-06-12", valor_centavos: 220000 },
  { data: "2026-06-19", valor_centavos: 230000 },
  { data: "2026-06-26", valor_centavos: 300000 },
  { data: "2026-07-03", valor_centavos: 250000 },
  { data: "2026-07-10", valor_centavos: 250000 },
  { data: "2026-07-17", valor_centavos: 250000 },
  { data: "2026-07-24", valor_centavos: 210000 },
  { data: "2026-07-31", valor_centavos: 130000 },
  { data: "2026-08-22", valor_centavos: 80000 },
];

const VALOR_CONTRATO = 7182500; // R$ 71.825,00

describe("valores do briefing", () => {
  it("o contrato fecha em R$ 71.825", () => {
    const soma = ETAPAS.reduce((acc, e) => acc + e.valor_orcado_centavos, 0);
    expect(soma).toBe(VALOR_CONTRATO);
  });

  it("total pago é R$ 46.605", () => {
    expect(totalPagoCentavos(PAGAMENTOS)).toBe(4660500);
  });

  it("serviço entregue é R$ 38.554,50", () => {
    expect(valorEntregueCentavos(ETAPAS)).toBe(3855450);
  });

  it("adiantamento é R$ 8.050,50", () => {
    expect(adiantamentoCentavos(totalPagoCentavos(PAGAMENTOS), ETAPAS)).toBe(805050);
  });

  it("avanço físico ponderado ≈ 54% e contagem simples = 40%", () => {
    expect(avancoFisicoPonderado(ETAPAS)).toBeCloseTo(53.68, 1);
    expect(avancoPorContagem(ETAPAS)).toBeCloseTo(40, 5);
  });

  it("avanço financeiro ≈ 64,9% do contrato", () => {
    expect(avancoFinanceiro(4660500, VALOR_CONTRATO)).toBeCloseTo(64.89, 1);
  });
});

describe("avancoFisicoPonderado — casos de borda", () => {
  it("sem etapas retorna 0", () => {
    expect(avancoFisicoPonderado([])).toBe(0);
  });

  it("pondera pelo valor, não pela contagem", () => {
    const etapas = [
      { valor_orcado_centavos: 900000, percentual_concluido: 100 },
      { valor_orcado_centavos: 100000, percentual_concluido: 0 },
    ];
    expect(avancoFisicoPonderado(etapas)).toBe(90);
    expect(avancoPorContagem(etapas)).toBe(50);
  });
});

describe("mediaSemanalCentavos e projeção", () => {
  it("usa os últimos 8 pagamentos por padrão", () => {
    // últimos 8: 220000+230000+300000+250000+250000+250000+210000+130000+80000 → 8 últimos
    const ultimos8 = [230000, 300000, 250000, 250000, 250000, 210000, 130000, 80000];
    const esperado = Math.round(ultimos8.reduce((a, b) => a + b, 0) / 8);
    expect(mediaSemanalCentavos(PAGAMENTOS)).toBe(esperado);
  });

  it("projeção = saldo / média, em semanas", () => {
    const saldo = VALOR_CONTRATO - 4660500; // R$ 25.220,00
    expect(projecaoSemanasRestantes(saldo, 210000)).toBeCloseTo(12.0, 1);
  });

  it("sem ritmo retorna null; saldo zerado retorna 0", () => {
    expect(projecaoSemanasRestantes(100, 0)).toBeNull();
    expect(projecaoSemanasRestantes(0, 210000)).toBe(0);
  });
});

describe("semanasSemPagamento", () => {
  it("detecta a semana pulada de maio e a paralisação de agosto", () => {
    const intervalos = semanasSemPagamento(PAGAMENTOS);
    expect(intervalos).toEqual([
      { ultimoPagamento: "2026-03-20", proximoPagamento: "2026-04-03", dias: 14 },
      { ultimoPagamento: "2026-05-08", proximoPagamento: "2026-05-22", dias: 14 },
      { ultimoPagamento: "2026-07-31", proximoPagamento: "2026-08-22", dias: 22 },
    ]);
  });

  it("ritmo semanal normal não gera intervalo", () => {
    expect(
      semanasSemPagamento([
        { data: "2026-01-02", valor_centavos: 1 },
        { data: "2026-01-09", valor_centavos: 1 },
      ])
    ).toEqual([]);
  });

  it("dias desde o último pagamento", () => {
    expect(diasDesdeUltimoPagamento(PAGAMENTOS, "2026-09-03")).toBe(12);
    expect(diasDesdeUltimoPagamento([], "2026-09-03")).toBeNull();
  });
});

describe("curvaDesembolso", () => {
  it("acumula em ordem cronológica", () => {
    const curva = curvaDesembolso(PAGAMENTOS);
    expect(curva[0]).toEqual({ data: "2026-03-06", acumuladoCentavos: 200000 });
    expect(curva.at(-1)).toEqual({ data: "2026-08-22", acumuladoCentavos: 4660500 });
    expect(curva).toHaveLength(21);
  });

  it("mescla pagamentos do mesmo dia num único ponto", () => {
    const curva = curvaDesembolso([
      { data: "2026-01-02", valor_centavos: 100 },
      { data: "2026-01-02", valor_centavos: 50 },
    ]);
    expect(curva).toEqual([{ data: "2026-01-02", acumuladoCentavos: 150 }]);
  });
});

describe("statusEtapa", () => {
  it("deriva o status do percentual", () => {
    expect(statusEtapa(0)).toBe("nao_iniciada");
    expect(statusEtapa(1)).toBe("em_andamento");
    expect(statusEtapa(99)).toBe("em_andamento");
    expect(statusEtapa(100)).toBe("concluida");
  });
});
