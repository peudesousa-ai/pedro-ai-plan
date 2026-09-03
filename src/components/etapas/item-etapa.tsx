"use client";

import { useState, useTransition } from "react";
import { History, Pencil } from "lucide-react";
import { atualizarPercentual, editarEtapa } from "@/app/(app)/etapas/actions";
import { statusEtapa } from "@/lib/calculos";
import {
  formatarBRL,
  formatarData,
  parseValorParaCentavos,
} from "@/lib/formato";
import type { Etapa, EtapaHistorico } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ROTULOS_STATUS = {
  nao_iniciada: { texto: "Não iniciada", variante: "outline" as const },
  em_andamento: { texto: "Em andamento", variante: "secondary" as const },
  concluida: { texto: "Concluída", variante: "ok" as const },
};

export function ItemEtapa({
  etapa,
  historico,
  nomesAutores,
  ehAdmin,
}: {
  etapa: Etapa;
  historico: EtapaHistorico[];
  nomesAutores: Record<string, string>;
  ehAdmin: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [percentual, setPercentual] = useState(etapa.percentual_concluido);
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  const status = statusEtapa(etapa.percentual_concluido);
  const rotulo = ROTULOS_STATUS[status];
  const entregue = Math.round(
    (etapa.valor_orcado_centavos * etapa.percentual_concluido) / 100
  );
  const falta = etapa.valor_orcado_centavos - entregue;

  function salvarPercentual() {
    setErro(null);
    startTransition(async () => {
      const resultado = await atualizarPercentual(etapa.id, percentual, nota);
      if (resultado.erro) {
        setErro(resultado.erro);
      } else {
        setNota("");
        setEditando(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{etapa.nome}</p>
        <Badge variant={rotulo.variante}>{rotulo.texto}</Badge>
        {etapa.valor_rateado && (
          <Badge variant="alerta" title="Valor estimado por rateio de um pacote do orçamento — edite quando tiver o número real">
            valor rateado
          </Badge>
        )}
        {etapa.origem === "aditivo" && <Badge variant="secondary">aditivo</Badge>}
      </div>

      <div className="flex items-center gap-3">
        <Progress value={etapa.percentual_concluido} className="h-2.5 flex-1" />
        <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
          {etapa.percentual_concluido}%
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Orçado {formatarBRL(etapa.valor_orcado_centavos)} · entregue{" "}
        {formatarBRL(entregue)} · falta {formatarBRL(falta)}
      </p>
      {etapa.observacao && (
        <p className="text-xs italic text-muted-foreground">{etapa.observacao}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {ehAdmin && !editando && (
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            Atualizar %
          </Button>
        )}
        {ehAdmin && <DialogoEditarEtapa etapa={etapa} />}
        {historico.length > 0 && (
          <DialogoHistorico etapa={etapa} historico={historico} nomesAutores={nomesAutores} />
        )}
      </div>

      {editando && (
        <div className="mt-1 flex flex-col gap-3 rounded-lg border bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={percentual}
              onChange={(e) => setPercentual(Number(e.target.value))}
              className="flex-1 accent-primary"
              aria-label={`Percentual concluído de ${etapa.nome}`}
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={percentual}
              onChange={(e) => setPercentual(Number(e.target.value))}
              className="w-20 text-right tabular-nums"
              inputMode="numeric"
            />
            <span className="text-sm">%</span>
          </div>
          <Textarea
            placeholder="Nota (opcional): o que foi feito, quem confirmou…"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
          />
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={salvarPercentual} disabled={pendente}>
              {pendente ? "Salvando…" : "Salvar"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditando(false);
                setPercentual(etapa.percentual_concluido);
                setErro(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DialogoEditarEtapa({ etapa }: { etapa: Etapa }) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState((etapa.valor_orcado_centavos / 100).toFixed(2).replace(".", ","));
  const [observacao, setObservacao] = useState(etapa.observacao ?? "");
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
      const resultado = await editarEtapa(etapa.id, centavos, observacao);
      if (resultado.erro) setErro(resultado.erro);
      else setAberto(false);
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {etapa.nome}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {etapa.valor_rateado && (
            <p className="rounded-md bg-alerta-fundo p-3 text-sm text-alerta-foreground">
              Este valor veio de rateio estimado de um pacote do orçamento.
              Ao salvar um valor editado, a marca de rateio é removida.
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`valor-${etapa.id}`}>Valor orçado (R$)</Label>
            <Input
              id={`valor-${etapa.id}`}
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`obs-${etapa.id}`}>Observação</Label>
            <Textarea
              id={`obs-${etapa.id}`}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
            />
          </div>
          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
          <Button onClick={salvar} disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DialogoHistorico({
  etapa,
  historico,
  nomesAutores,
}: {
  etapa: Etapa;
  historico: EtapaHistorico[];
  nomesAutores: Record<string, string>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4" /> Histórico
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Histórico — {etapa.nome}</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-3">
          {historico.map((registro) => (
            <li key={registro.id} className="border-l-2 border-border pl-3 text-sm">
              <p className="font-medium tabular-nums">
                {registro.percentual_anterior}% → {registro.percentual_novo}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatarData(registro.criado_em.slice(0, 10))}
                {registro.autor && nomesAutores[registro.autor]
                  ? ` · ${nomesAutores[registro.autor]}`
                  : ""}
              </p>
              {registro.nota && <p className="mt-0.5 text-xs">{registro.nota}</p>}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
