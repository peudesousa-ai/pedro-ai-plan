"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/sessao";
import { hojeIso } from "@/lib/formato";
import type { GrupoEtapa } from "@/lib/types";

export interface ResultadoAcao {
  erro: string | null;
}

/** Atualiza o % concluído de uma etapa e grava o histórico da mudança. */
export async function atualizarPercentual(
  etapaId: string,
  novoPercentual: number,
  nota: string
): Promise<ResultadoAcao> {
  const perfil = await exigirAdmin();
  const supabase = await criarClienteServidor();

  const percentual = Math.round(novoPercentual);
  if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
    return { erro: "Percentual precisa estar entre 0 e 100." };
  }

  const { data: etapa, error: erroBusca } = await supabase
    .from("etapas")
    .select("percentual_concluido, data_inicio, data_conclusao")
    .eq("id", etapaId)
    .single();
  if (erroBusca || !etapa) return { erro: "Etapa não encontrada." };

  if (etapa.percentual_concluido === percentual) {
    return { erro: null };
  }

  const hoje = hojeIso();
  const { error: erroEtapa } = await supabase
    .from("etapas")
    .update({
      percentual_concluido: percentual,
      data_inicio: etapa.data_inicio ?? (percentual > 0 ? hoje : null),
      data_conclusao: percentual === 100 ? (etapa.data_conclusao ?? hoje) : null,
    })
    .eq("id", etapaId);
  if (erroEtapa) return { erro: `Não foi possível salvar: ${erroEtapa.message}` };

  const { error: erroHistorico } = await supabase.from("etapa_historico").insert({
    etapa_id: etapaId,
    percentual_anterior: etapa.percentual_concluido,
    percentual_novo: percentual,
    autor: perfil.id,
    nota: nota.trim() || null,
  });
  if (erroHistorico) {
    return { erro: `Percentual salvo, mas o histórico falhou: ${erroHistorico.message}` };
  }

  revalidatePath("/etapas");
  revalidatePath("/dashboard");
  return { erro: null };
}

/** Edita valor orçado (e observação). Valor editado deixa de ser rateio estimado. */
export async function editarEtapa(
  etapaId: string,
  valorOrcadoCentavos: number,
  observacao: string
): Promise<ResultadoAcao> {
  await exigirAdmin();
  const supabase = await criarClienteServidor();

  if (!Number.isInteger(valorOrcadoCentavos) || valorOrcadoCentavos < 0) {
    return { erro: "Valor inválido." };
  }

  const { data: etapa } = await supabase
    .from("etapas")
    .select("valor_orcado_centavos, valor_rateado")
    .eq("id", etapaId)
    .single();
  if (!etapa) return { erro: "Etapa não encontrada." };

  const valorMudou = etapa.valor_orcado_centavos !== valorOrcadoCentavos;

  const { error } = await supabase
    .from("etapas")
    .update({
      valor_orcado_centavos: valorOrcadoCentavos,
      observacao: observacao.trim() || null,
      // quem edita o valor assumiu um número real — sai da marca de rateio
      valor_rateado: valorMudou ? false : etapa.valor_rateado,
    })
    .eq("id", etapaId);
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath("/etapas");
  revalidatePath("/dashboard");
  return { erro: null };
}

/** Cria etapa nova — usada para aditivos de escopo (ex.: telhado da casa). */
export async function criarEtapa(dados: {
  nome: string;
  grupo: GrupoEtapa;
  valorOrcadoCentavos: number;
  aditivo: boolean;
  observacao: string;
}): Promise<ResultadoAcao> {
  await exigirAdmin();
  const supabase = await criarClienteServidor();

  const nome = dados.nome.trim();
  if (!nome) return { erro: "Dê um nome à etapa." };
  if (!Number.isInteger(dados.valorOrcadoCentavos) || dados.valorOrcadoCentavos < 0) {
    return { erro: "Valor inválido." };
  }

  const { data: ultima } = await supabase
    .from("etapas")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("etapas").insert({
    nome,
    grupo: dados.grupo,
    valor_orcado_centavos: dados.valorOrcadoCentavos,
    ordem: (ultima?.ordem ?? 0) + 1,
    origem: dados.aditivo ? "aditivo" : "contrato",
    observacao: dados.observacao.trim() || null,
  });
  if (error) return { erro: `Não foi possível criar: ${error.message}` };

  revalidatePath("/etapas");
  revalidatePath("/dashboard");
  return { erro: null };
}
