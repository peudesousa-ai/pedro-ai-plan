/**
 * Cria os usuários da obra no Supabase Auth + tabela perfis.
 *
 * Nada sensível entra no repositório: CPFs, nomes e senhas vêm de variáveis
 * de ambiente (arquivo .env local, nunca commitado).
 *
 * Uso:
 *   npx tsx scripts/seed-usuarios.ts
 *
 * Variáveis esperadas (ver .env.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   SEED_USUARIOS  — JSON: [{"nome":"...","cpf":"...","senha":"...","papel":"admin"|"visualizador"}, ...]
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { normalizarCpf, validarCpf, emailSintetico } from "../src/lib/cpf";

config({ path: ".env" });

interface UsuarioSeed {
  nome: string;
  cpf: string;
  senha: string;
  papel: "admin" | "visualizador";
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const usuariosJson = process.env.SEED_USUARIOS;

  if (!url || !serviceRole) {
    console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
    process.exit(1);
  }
  if (!usuariosJson) {
    console.error(
      'Defina SEED_USUARIOS no .env. Exemplo:\n' +
        'SEED_USUARIOS=\'[{"nome":"Fulano","cpf":"111.444.777-35","senha":"troque-me","papel":"admin"}]\''
    );
    process.exit(1);
  }

  let usuarios: UsuarioSeed[];
  try {
    usuarios = JSON.parse(usuariosJson);
  } catch {
    console.error("SEED_USUARIOS não é um JSON válido");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const usuario of usuarios) {
    const cpf = normalizarCpf(usuario.cpf);
    if (!validarCpf(cpf)) {
      // não imprime o CPF: identifica pelo nome
      console.error(`CPF inválido para "${usuario.nome}" — verifique o dígito verificador`);
      process.exitCode = 1;
      continue;
    }
    if (!usuario.senha || usuario.senha.length < 8) {
      console.error(`Senha de "${usuario.nome}" precisa de ao menos 8 caracteres`);
      process.exitCode = 1;
      continue;
    }

    const { data: criado, error: erroAuth } = await supabase.auth.admin.createUser({
      email: emailSintetico(cpf),
      password: usuario.senha,
      email_confirm: true,
    });

    if (erroAuth) {
      console.error(`Erro ao criar usuário "${usuario.nome}": ${erroAuth.message}`);
      process.exitCode = 1;
      continue;
    }

    const { error: erroPerfil } = await supabase.from("perfis").upsert({
      id: criado.user.id,
      nome: usuario.nome,
      cpf,
      papel: usuario.papel,
    });

    if (erroPerfil) {
      console.error(`Erro ao criar perfil de "${usuario.nome}": ${erroPerfil.message}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`Usuário "${usuario.nome}" criado como ${usuario.papel}`);
  }
}

main();
