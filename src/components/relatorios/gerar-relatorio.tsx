"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { gerarRelatorio } from "@/app/(app)/relatorios/actions";
import { hojeIso } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GerarRelatorio() {
  const hoje = hojeIso();
  const [aberto, setAberto] = useState(false);
  const [inicio, setInicio] = useState(`${hoje.slice(0, 7)}-01`);
  const [fim, setFim] = useState(hoje);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function gerar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await gerarRelatorio(inicio, fim);
      if (resultado.erro) setErro(resultado.erro);
      else setAberto(false);
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Gerar relatório
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar relatório de período</DialogTitle>
          <DialogDescription>
            Os números são congelados no momento da geração. Depois do aceite do
            pedreiro, o relatório fica imutável.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rel-inicio">Início</Label>
              <Input
                id="rel-inicio"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rel-fim">Fim</Label>
              <Input
                id="rel-fim"
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
          </div>
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <Button onClick={gerar} disabled={pendente}>
            {pendente ? "Gerando…" : "Gerar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
