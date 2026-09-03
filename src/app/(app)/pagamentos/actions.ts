"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/sessao";
import type { TipoPagamento } from "@/lib/types";

export interface ResultadoAcao {
  erro: string | null;
}

export async function criarPagamento(dados: {
  data: string;
  valorCentavos: number;
  tipo: TipoPagamento;
  observacao: string;
  comprovantePath: string | null;
}): Promise<ResultadoAcao> {
  const perfil = await exigirAdmin();
  const supabase = await criarClienteServidor();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) {
    return { erro: "Data inválida." };
  }
  if (!Number.isInteger(dados.valorCentavos) || dados.valorCentavos <= 0) {
    return { erro: "Valor precisa ser maior que zero." };
  }

  const { error } = await supabase.from("pagamentos").insert({
    data: dados.data,
    valor_centavos: dados.valorCentavos,
    tipo: dados.tipo,
    pago_por: perfil.id,
    observacao: dados.observacao.trim() || null,
    comprovante_path: dados.comprovantePath,
  });
  if (error) return { erro: `Não foi possível lançar: ${error.message}` };

  revalidatePath("/pagamentos");
  revalidatePath("/dashboard");
  return { erro: null };
}

export async function excluirPagamento(pagamentoId: string): Promise<ResultadoAcao> {
  await exigirAdmin();
  const supabase = await criarClienteServidor();

  const { data: pagamento } = await supabase
    .from("pagamentos")
    .select("comprovante_path")
    .eq("id", pagamentoId)
    .single();

  const { error } = await supabase.from("pagamentos").delete().eq("id", pagamentoId);
  if (error) return { erro: `Não foi possível excluir: ${error.message}` };

  if (pagamento?.comprovante_path) {
    await supabase.storage.from("comprovantes").remove([pagamento.comprovante_path]);
  }

  revalidatePath("/pagamentos");
  revalidatePath("/dashboard");
  return { erro: null };
}
