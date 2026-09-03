"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { emailSintetico, normalizarCpf, validarCpf } from "@/lib/cpf";

export interface EstadoLogin {
  erro: string | null;
}

export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const cpf = normalizarCpf(String(formData.get("cpf") ?? ""));
  const senha = String(formData.get("senha") ?? "");

  // Mensagens de erro nunca incluem o CPF digitado.
  if (!validarCpf(cpf)) {
    return { erro: "CPF inválido. Confira os números digitados." };
  }
  if (!senha) {
    return { erro: "Digite a senha." };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailSintetico(cpf),
    password: senha,
  });

  if (error) {
    return { erro: "CPF ou senha incorretos." };
  }

  redirect("/dashboard");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
