"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Erro dentro do app autenticado — linguagem simples, sem jargão técnico. */
export default function ErroApp({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="rounded-2xl bg-alerta-fundo p-4 text-alerta-foreground">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">
          Algo deu errado ao carregar esta tela
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pode ter sido uma falha de conexão. Tente de novo — seus dados estão
          salvos.
        </p>
        <Button onClick={reset}>Tentar de novo</Button>
      </div>
    </div>
  );
}
