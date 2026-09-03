/** Utilidades de CPF: normalização, máscara e validação do dígito verificador. */

export function normalizarCpf(entrada: string): string {
  return entrada.replace(/\D/g, "");
}

export function formatarCpf(entrada: string): string {
  const cpf = normalizarCpf(entrada).slice(0, 11);
  const partes = [cpf.slice(0, 3), cpf.slice(3, 6), cpf.slice(6, 9), cpf.slice(9, 11)];
  let saida = partes[0];
  if (partes[1]) saida += "." + partes[1];
  if (partes[2]) saida += "." + partes[2];
  if (partes[3]) saida += "-" + partes[3];
  return saida;
}

function digitoVerificador(base: string): number {
  const soma = base
    .split("")
    .reduce((acc, digito, i) => acc + Number(digito) * (base.length + 1 - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function validarCpf(entrada: string): boolean {
  const cpf = normalizarCpf(entrada);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  if (digitoVerificador(cpf.slice(0, 9)) !== Number(cpf[9])) return false;
  if (digitoVerificador(cpf.slice(0, 10)) !== Number(cpf[10])) return false;
  return true;
}

/**
 * E-mail sintético usado no Supabase Auth. O CPF nunca aparece em URL, log ou
 * mensagem de erro — só é trocado por este e-mail na chamada de login.
 */
export function emailSintetico(cpf: string): string {
  return `${normalizarCpf(cpf)}@obra.local`;
}
