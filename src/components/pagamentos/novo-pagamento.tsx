"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { criarPagamento } from "@/app/(app)/pagamentos/actions";
import { enviarComprovante } from "@/lib/comprovante";
import { hojeIso, parseValorParaCentavos } from "@/lib/formato";
import type { TipoPagamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CampoComprovante } from "@/components/campo-comprovante";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NovoPagamento() {
  const [aberto, setAberto] = useState(false);
  const [data, setData] = useState(hojeIso());
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoPagamento>("mao_de_obra");
  const [observacao, setObservacao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function salvar() {
    const centavos = parseValorParaCentavos(valor);
    if (centavos === null || centavos <= 0) {
      setErro("Valor inválido. Use o formato 2.200,00.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      try {
        const comprovantePath = arquivo
          ? await enviarComprovante(arquivo, "pagamentos")
          : null;
        const resultado = await criarPagamento({
          data,
          valorCentavos: centavos,
          tipo,
          observacao,
          comprovantePath,
        });
        if (resultado.erro) {
          setErro(resultado.erro);
          return;
        }
        setAberto(false);
        setValor("");
        setObservacao("");
        setArquivo(null);
        setData(hojeIso());
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro inesperado no envio.");
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Lançar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar pagamento</DialogTitle>
          <DialogDescription>
            Anexe a foto do PIX ou do recibo — é o que dá lastro ao controle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pag-data">Data</Label>
              <Input
                id="pag-data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pag-valor">Valor (R$)</Label>
              <Input
                id="pag-valor"
                inputMode="decimal"
                placeholder="2.200,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pag-tipo">Tipo</Label>
            <Select
              id="pag-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoPagamento)}
            >
              <option value="mao_de_obra">Mão de obra (contrato)</option>
              <option value="aditivo">Aditivo</option>
            </Select>
          </div>
          <CampoComprovante arquivo={arquivo} aoMudar={setArquivo} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pag-obs">Observação</Label>
            <Textarea
              id="pag-obs"
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <Button onClick={salvar} disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar pagamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
