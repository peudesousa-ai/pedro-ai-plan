"use server";

import { revalidatePath } from "next/cache";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export interface ResultadoAceite {
  erro: string | null;
  ok: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Aceite formal do relatório pelo pedreiro, sem login: o token público é a
 * credencial. Validação e escrita acontecem no servidor com service role —
 * a RLS continua fechada para anônimos.
 */
export async function aceitarRelatorio(
  token: string,
  nome: string
): Promise<ResultadoAceite> {
  const assinatura = nome.trim();
  if (assinatura.length < 3) {
    return { erro: "Digite o nome completo para confirmar.", ok: false };
  }
  if (!UUID.test(token)) {
    return { erro: "Link inválido.", ok: false };
  }

  const supabase = criarClienteAdmin();

  const { data: relatorio } = await supabase
    .from("relatorios")
    .select("id, aceito_em")
    .eq("token_publico", token)
    .maybeSingle();

  if (!relatorio) return { erro: "Relatório não encontrado.", ok: false };
  if (relatorio.aceito_em) {
    return { erro: "Este relatório já foi aceito.", ok: false };
  }

  const { error } = await supabase
    .from("relatorios")
    .update({
      aceito_em: new Date().toISOString(),
      aceito_por: assinatura,
      assinatura_nome: assinatura,
    })
    .eq("id", relatorio.id)
    .is("aceito_em", null);

  if (error) return { erro: "Não foi possível registrar o aceite.", ok: false };

  revalidatePath(`/aceite/${token}`);
  revalidatePath("/relatorios");
  return { erro: null, ok: true };
}
