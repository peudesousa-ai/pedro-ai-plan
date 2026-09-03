import { criarClienteServidor } from "@/lib/supabase/server";
import type { Configuracoes, Etapa, Material, Pagamento } from "@/lib/types";

export async function buscarDadosObra() {
  const supabase = await criarClienteServidor();

  const [etapasRes, pagamentosRes, materiaisRes, configRes] = await Promise.all([
    supabase.from("etapas").select("*").order("ordem"),
    supabase.from("pagamentos").select("*").order("data"),
    supabase.from("materiais").select("*").order("data", { ascending: false }),
    supabase.from("configuracoes").select("*").maybeSingle(),
  ]);

  const erro =
    etapasRes.error ?? pagamentosRes.error ?? materiaisRes.error ?? configRes.error;
  if (erro) {
    throw new Error(`Erro ao carregar dados da obra: ${erro.message}`);
  }

  return {
    etapas: (etapasRes.data ?? []) as Etapa[],
    pagamentos: (pagamentosRes.data ?? []) as Pagamento[],
    materiais: (materiaisRes.data ?? []) as Material[],
    configuracoes: (configRes.data ?? {
      valor_contrato_centavos: 0,
      data_alvo: null,
      nome_responsavel_obra: "",
    }) as Configuracoes,
  };
}
