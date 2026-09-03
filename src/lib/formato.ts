/** Formatação de valores (centavos → BRL) e datas (date sem timezone → pt-BR). */

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarBRL(centavos: number): string {
  return formatadorBRL.format(centavos / 100);
}

export function formatarBRLCompacto(centavos: number): string {
  const reais = centavos / 100;
  if (Math.abs(reais) >= 1000) {
    return `R$ ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(reais / 1000)} mil`;
  }
  return formatadorBRL.format(reais);
}

/** Converte string "1.234,56" ou "1234.56" digitada pelo usuário em centavos. */
export function parseValorParaCentavos(entrada: string): number | null {
  const limpo = entrada.trim().replace(/[R$\s]/g, "");
  if (!limpo) return null;
  // formato brasileiro: ponto de milhar, vírgula decimal
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  const valor = Number(normalizado);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return Math.round(valor * 100);
}

/** Formata um `date` do banco (string ISO yyyy-mm-dd) sem sofrer com timezone. */
export function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataCurta(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}

export function formatarPercentual(valor: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(valor)}%`;
}

export function hojeIso(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
