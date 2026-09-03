"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/sessao";

export interface ResultadoAcao {
  erro: string | null;
}

function revalidar() {
  revalidatePath("/materiais");
  revalidatePath("/dashboard");
}

export async function criarMaterial(dados: {
  descricao: string;
  quantidade: string;
  fornecedor: string;
  etapaId: string | null;
  status: "comprado" | "necessario";
  data: string | null;
  valorCentavos: number | null;
  comprovantePath: string | null;
}): Promise<ResultadoAcao> {
  const perfil = await exigirAdmin();
  const supabase = await criarClienteServidor();

  const descricao = dados.descricao.trim();
  if (!descricao) return { erro: "Descreva o material." };
  if (dados.status === "comprado") {
    if (!dados.data || !/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) {
      return { erro: "Informe a data da compra." };
    }
    if (!Number.isInteger(dados.valorCentavos) || (dados.valorCentavos ?? 0) <= 0) {
      return { erro: "Informe o valor pago." };
    }
  }

  const { error } = await supabase.from("materiais").insert({
    descricao,
    quantidade: dados.quantidade.trim() || null,
    fornecedor: dados.fornecedor.trim() || null,
    etapa_id: dados.etapaId,
    status: dados.status,
    data: dados.status === "comprado" ? dados.data : null,
    valor_centavos: dados.valorCentavos,
    comprovante_path: dados.comprovantePath,
    pago_por: dados.status === "comprado" ? perfil.id : null,
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidar();
  return { erro: null };
}

/** Converte um item "necessário" em "comprado", preservando o mesmo registro. */
export async function marcarComprado(
  materialId: string,
  dados: {
    data: string;
    valorCentavos: number;
    fornecedor: string;
    comprovantePath: string | null;
  }
): Promise<ResultadoAcao> {
  const perfil = await exigirAdmin();
  const supabase = await criarClienteServidor();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) return { erro: "Data inválida." };
  if (!Number.isInteger(dados.valorCentavos) || dados.valorCentavos <= 0) {
    return { erro: "Informe o valor pago." };
  }

  const { error } = await supabase
    .from("materiais")
    .update({
      status: "comprado",
      data: dados.data,
      valor_centavos: dados.valorCentavos,
      fornecedor: dados.fornecedor.trim() || null,
      comprovante_path: dados.comprovantePath,
      pago_por: perfil.id,
    })
    .eq("id", materialId)
    .eq("status", "necessario");
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidar();
  return { erro: null };
}

export async function excluirMaterial(materialId: string): Promise<ResultadoAcao> {
  await exigirAdmin();
  const supabase = await criarClienteServidor();

  const { data: material } = await supabase
    .from("materiais")
    .select("comprovante_path")
    .eq("id", materialId)
    .single();

  const { error } = await supabase.from("materiais").delete().eq("id", materialId);
  if (error) return { erro: `Não foi possível excluir: ${error.message}` };

  if (material?.comprovante_path) {
    await supabase.storage.from("comprovantes").remove([material.comprovante_path]);
  }

  revalidar();
  return { erro: null };
}
