"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { marcarComprado } from "@/app/(app)/materiais/actions";
import { enviarComprovante } from "@/lib/comprovante";
import { formatarBRL, hojeIso, parseValorParaCentavos } from "@/lib/formato";
import type { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampoComprovante } from "@/components/campo-comprovante";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Um clique em "Comprei" abre o lançamento já preenchido com o item da lista. */
export function ComprarMaterial({ material }: { material: Material }) {
  const [aberto, setAberto] = useState(false);
  const [data, setData] = useState(hojeIso());
  const [valor, setValor] = useState(
    material.valor_centavos != null
      ? (material.valor_centavos / 100).toFixed(2).replace(".", ",")
      : ""
  );
  const [fornecedor, setFornecedor] = useState(material.fornecedor ?? "");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function salvar() {
    const centavos = parseValorParaCentavos(valor);
    if (centavos === null || centavos <= 0) {
      setErro("Informe o valor pago.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      try {
        const comprovantePath = arquivo
          ? await enviarComprovante(arquivo, "materiais")
          : null;
        const resultado = await marcarComprado(material.id, {
          data,
          valorCentavos: centavos,
          fornecedor,
          comprovantePath,
        });
        if (resultado.erro) {
          setErro(resultado.erro);
          return;
        }
        setAberto(false);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro inesperado no envio.");
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShoppingCart className="h-4 w-4" /> Comprei
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comprei: {material.descricao}</DialogTitle>
          <DialogDescription>
            {material.quantidade ? `${material.quantidade} · ` : ""}
            {material.valor_centavos != null
              ? `estimado em ${formatarBRL(material.valor_centavos)}`
              : "sem valor estimado"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`compra-data-${material.id}`}>Data</Label>
              <Input
                id={`compra-data-${material.id}`}
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`compra-valor-${material.id}`}>Valor pago (R$)</Label>
              <Input
                id={`compra-valor-${material.id}`}
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`compra-forn-${material.id}`}>Fornecedor</Label>
            <Input
              id={`compra-forn-${material.id}`}
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
            />
          </div>
          <CampoComprovante arquivo={arquivo} aoMudar={setArquivo} />
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <Button onClick={salvar} disabled={pendente}>
            {pendente ? "Salvando…" : "Confirmar compra"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
