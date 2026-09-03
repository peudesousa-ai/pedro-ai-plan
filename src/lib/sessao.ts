import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/types";

/** Retorna o perfil do usuário logado ou redireciona para o login. */
export async function exigirPerfil(): Promise<Perfil> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, nome, cpf, papel")
    .eq("id", user.id)
    .single();

  if (!perfil) redirect("/");

  return perfil as Perfil;
}

export async function exigirAdmin(): Promise<Perfil> {
  const perfil = await exigirPerfil();
  if (perfil.papel !== "admin") redirect("/dashboard");
  return perfil;
}
