"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { criarMaterial } from "@/app/(app)/materiais/actions";
import { enviarComprovante } from "@/lib/comprovante";
import { hojeIso, parseValorParaCentavos } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CampoComprovante } from "@/components/campo-comprovante";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EtapaOpcao {
  id: string;
  nome: string;
}

export function NovoMaterial({ etapas }: { etapas: EtapaOpcao[] }) {
  const [aberto, setAberto] = useState(false);
  const [status, setStatus] = useState<"comprado" | "necessario">("comprado");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [etapaId, setEtapaId] = useState("");
  const [data, setData] = useState(hojeIso());
  const [valor, setValor] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function salvar() {
    const centavos = valor.trim() ? parseValorParaCentavos(valor) : null;
    if (valor.trim() && centavos === null) {
      setErro("Valor inválido. Use o formato 1.234,56.");
      return;
    }
    if (status === "comprado" && (centavos === null || centavos <= 0)) {
      setErro("Informe o valor pago.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      try {
        const comprovantePath =
          arquivo && status === "comprado"
            ? await enviarComprovante(arquivo, "materiais")
            : null;
        const resultado = await criarMaterial({
          descricao,
          quantidade,
          fornecedor,
          etapaId: etapaId || null,
          status,
          data: status === "comprado" ? data : null,
          valorCentavos: centavos,
          comprovantePath,
        });
        if (resultado.erro) {
          setErro(resultado.erro);
          return;
        }
        setAberto(false);
        setDescricao("");
        setQuantidade("");
        setFornecedor("");
        setEtapaId("");
        setValor("");
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
          <Plus className="h-4 w-4" /> Lançar material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar material</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={status === "comprado" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus("comprado")}
            >
              Já comprei
            </Button>
            <Button
              type="button"
              variant={status === "necessario" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus("necessario")}
            >
              Falta comprar
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mat-desc">Material</Label>
            <Input
              id="mat-desc"
              placeholder="Ex.: Cimento CP-II 50 kg"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mat-qtd">Quantidade</Label>
              <Input
                id="mat-qtd"
                placeholder="Ex.: 10 sacos"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mat-valor">
                {status === "comprado" ? "Valor pago (R$)" : "Valor estimado (R$)"}
              </Label>
              <Input
                id="mat-valor"
                inputMode="decimal"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>
          {status === "comprado" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mat-data">Data da compra</Label>
                <Input
                  id="mat-data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mat-forn">Fornecedor</Label>
                <Input
                  id="mat-forn"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mat-etapa">Etapa (opcional)</Label>
            <Select
              id="mat-etapa"
              value={etapaId}
              onChange={(e) => setEtapaId(e.target.value)}
            >
              <option value="">Sem etapa específica</option>
              {etapas.map((etapa) => (
                <option key={etapa.id} value={etapa.id}>
                  {etapa.nome}
                </option>
              ))}
            </Select>
          </div>
          {status === "comprado" && (
            <CampoComprovante arquivo={arquivo} aoMudar={setArquivo} />
          )}
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <Button onClick={salvar} disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
