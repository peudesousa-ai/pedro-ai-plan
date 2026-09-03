"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { aceitarRelatorio } from "@/app/aceite/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormularioAceite({ token }: { token: string }) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aceito, setAceito] = useState(false);
  const [pendente, startTransition] = useTransition();

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await aceitarRelatorio(token, nome);
      if (resultado.ok) setAceito(true);
      else setErro(resultado.erro);
    });
  }

  if (aceito) {
    return (
      <Card className="border-ok bg-ok-fundo">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-ok" />
          <p className="text-sm">
            Aceite registrado. Obrigado, {nome.trim()} — este relatório agora é o
            registro do que foi reconhecido como entregue nesta data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Confirmar aceite</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Confira os números acima. Ao confirmar, você declara que reconhece os
          serviços e valores listados até a data deste relatório.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="aceite-nome">Seu nome completo</Label>
          <Input
            id="aceite-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome de quem confere"
            autoComplete="name"
          />
        </div>
        {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
        <Button size="lg" onClick={confirmar} disabled={pendente}>
          {pendente ? "Registrando…" : "Confirmo os números deste relatório"}
        </Button>
      </CardContent>
    </Card>
  );
}
