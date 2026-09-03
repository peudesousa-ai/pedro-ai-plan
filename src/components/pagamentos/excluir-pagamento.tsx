"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirPagamento } from "@/app/(app)/pagamentos/actions";
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

export function ExcluirPagamento({
  pagamentoId,
  descricao,
}: {
  pagamentoId: string;
  descricao: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function excluir() {
    startTransition(async () => {
      const resultado = await excluirPagamento(pagamentoId);
      if (resultado.erro) setErro(resultado.erro);
      else setAberto(false);
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Excluir pagamento ${descricao}`}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir pagamento?</DialogTitle>
          <DialogDescription>
            {descricao} — o comprovante anexado também será removido. Essa ação não
            tem volta.
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
