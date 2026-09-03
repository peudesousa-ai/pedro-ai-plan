"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Falha ao carregar o relatório público. Quem abre esta tela é o pedreiro,
 * então a mensagem evita jargão técnico e oferece uma ação.
 */
export default function AceiteComErro({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="rounded-2xl bg-alerta-fundo p-4 text-alerta-foreground">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">
          Não foi possível abrir o relatório
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Houve uma falha ao carregar os dados. Tente de novo em instantes; se
          continuar, avise quem enviou o link.
        </p>
        <Button onClick={reset}>Tentar de novo</Button>
      </div>
    </main>
  );
}
