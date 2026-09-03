"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { criarEtapa } from "@/app/(app)/etapas/actions";
import { parseValorParaCentavos } from "@/lib/formato";
import { NOMES_GRUPOS, type GrupoEtapa } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NovaEtapa() {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [grupo, setGrupo] = useState<GrupoEtapa>("acabamento");
  const [valor, setValor] = useState("");
  const [aditivo, setAditivo] = useState(true);
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function salvar() {
    const centavos = parseValorParaCentavos(valor);
    if (centavos === null) {
      setErro("Valor inválido. Use o formato 1.234,56.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      const resultado = await criarEtapa({
        nome,
        grupo,
        valorOrcadoCentavos: centavos,
        aditivo,
        observacao,
      });
      if (resultado.erro) {
        setErro(resultado.erro);
      } else {
        setAberto(false);
        setNome("");
        setValor("");
        setObservacao("");
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Nova etapa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova etapa</DialogTitle>
          <DialogDescription>
            Serviço fora do combinado entra como aditivo, separado do contrato original.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nova-nome">Nome</Label>
            <Input
              id="nova-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Telhado da casa"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nova-grupo">Grupo</Label>
            <Select
              id="nova-grupo"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value as GrupoEtapa)}
            >
              {Object.entries(NOMES_GRUPOS).map(([chave, rotulo]) => (
                <option key={chave} value={chave}>
                  {rotulo}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nova-valor">Valor orçado (R$)</Label>
            <Input
              id="nova-valor"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={aditivo}
              onChange={(e) => setAditivo(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            É aditivo (fora do contrato de R$ 71.825)
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nova-obs">Observação</Label>
            <Textarea
              id="nova-obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
            />
          </div>
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <Button onClick={salvar} disabled={pendente}>
            {pendente ? "Criando…" : "Criar etapa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
