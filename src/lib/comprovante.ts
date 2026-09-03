import { criarClienteBrowser } from "@/lib/supabase/client";

export const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const TAMANHO_MAXIMO_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Sobe o comprovante direto do navegador para o bucket privado
 * (sem passar pelo servidor Next — sem limite de corpo da Vercel).
 * Retorna o path salvo.
 */
export async function enviarComprovante(
  arquivo: File,
  pasta: "pagamentos" | "materiais"
): Promise<string> {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    throw new Error("Use foto (JPG, PNG, WebP) ou PDF.");
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    throw new Error("Arquivo muito grande (máximo 15 MB).");
  }

  const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${pasta}/${crypto.randomUUID()}.${extensao}`;

  const supabase = criarClienteBrowser();
  const { error } = await supabase.storage
    .from("comprovantes")
    .upload(path, arquivo, { contentType: arquivo.type });

  if (error) {
    throw new Error(`Falha no envio do comprovante: ${error.message}`);
  }
  return path;
}
