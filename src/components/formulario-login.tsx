"use client";

import { useActionState, useState } from "react";
import { entrar, type EstadoLogin } from "@/app/(auth)/actions";
import { formatarCpf } from "@/lib/cpf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const estadoInicial: EstadoLogin = { erro: null };

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(entrar, estadoInicial);
  // campo controlado: o CPF sobrevive a uma tentativa com senha errada,
  // para ninguém precisar digitar os 11 dígitos de novo no celular
  const [cpf, setCpf] = useState("");

  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          name="cpf"
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          maxLength={14}
          required
          value={cpf}
          onChange={(e) => setCpf(formatarCpf(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {estado.erro && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {estado.erro}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pendente} className="mt-2">
        {pendente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
