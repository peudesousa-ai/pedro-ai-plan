"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Printer, Trash2 } from "lucide-react";
import { excluirRelatorio } from "@/app/(app)/relatorios/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Copia o link público de aceite para enviar ao pedreiro (WhatsApp etc.). */
export function CopiarLinkAceite({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}/aceite/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copiar}>
      {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copiado ? "Copiado!" : "Copiar link de aceite"}
    </Button>
  );
}

/** Exportação em PDF pelo diálogo de impressão do navegador. */
export function BotaoImprimir() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4" /> Salvar PDF
    </Button>
  );
}

export function ExcluirRelatorio({
  relatorioId,
  descricao,
}: {
  relatorioId: string;
  descricao: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function excluir() {
    startTransition(async () => {
      const resultado = await excluirRelatorio(relatorioId);
      if (resultado.erro) setErro(resultado.erro);
      else setAberto(false);
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Excluir relatório ${descricao}`}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir relatório?</DialogTitle>
          <DialogDescription>
            {descricao}. Relatórios já aceitos não podem ser excluídos.
          </DialogDescription>
        </DialogHeader>
        {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
        <div className="flex gap-2">
          <Button variant="destructive" onClick={excluir} disabled={pendente}>
            {pendente ? "Excluindo…" : "Excluir"}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
