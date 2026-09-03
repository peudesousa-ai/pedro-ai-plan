import { createClient } from "@supabase/supabase-js";

/**
 * Client com service role — ignora RLS. Uso restrito ao servidor,
 * hoje apenas na rota de aceite público de relatório (valida token_publico).
 */
export function criarClienteAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas");
  }
  return createClient(url, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
