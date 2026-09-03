import type { Metadata } from "next";
import { Paperclip } from "lucide-react";
import { exigirPerfil } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarBRL, formatarData } from "@/lib/formato";
import type { Etapa, Material } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovoMaterial } from "@/components/materiais/novo-material";
import { ComprarMaterial } from "@/components/materiais/comprar-material";
import { ExcluirMaterial } from "@/components/materiais/excluir-material";

export const metadata: Metadata = { title: "Materiais" };
export const dynamic = "force-dynamic";

export default async function PaginaMateriais() {
  const perfil = await exigirPerfil();
  const supabase = await criarClienteServidor();

  const [materiaisRes, etapasRes] = await Promise.all([
    supabase.from("materiais").select("*").order("criado_em", { ascending: false }),
    supabase.from("etapas").select("id, nome").order("ordem"),
  ]);
  const materiais = (materiaisRes.data ?? []) as Material[];
  const etapas = (etapasRes.data ?? []) as Pick<Etapa, "id" | "nome">[];
  const nomesEtapas = Object.fromEntries(etapas.map((e) => [e.id, e.nome]));

  const comprados = materiais
    .filter((m) => m.status === "comprado")
    .sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""));
  const necessarios = materiais.filter((m) => m.status === "necessario");

  const totalGasto = comprados.reduce((acc, m) => acc + (m.valor_centavos ?? 0), 0);
  const totalPrevisto = necessarios.reduce((acc, m) => acc + (m.valor_centavos ?? 0), 0);

  const paths = comprados
    .map((m) => m.comprovante_path)
    .filter((p): p is string => p !== null);
  const urlsAssinadas = new Map<string, string>();
  if (paths.length > 0) {
    const { data: assinadas } = await supabase.storage
      .from("comprovantes")
      .createSignedUrls(paths, 3600);
    for (const item of assinadas ?? []) {
      if (item.signedUrl && item.path) urlsAssinadas.set(item.path, item.signedUrl);
    }
  }

  const ehAdmin = perfil.papel === "admin";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Materiais</h1>
        {ehAdmin && <NovoMaterial etapas={etapas} />}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total gasto
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
              {formatarBRL(totalGasto)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Previsto (lista de compras)
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
              {formatarBRL(totalPrevisto)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de compras */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Falta comprar{" "}
            <span className="font-normal text-muted-foreground">
              ({necessarios.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {necessarios.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nada na lista. Adicione o que ainda falta comprar em “Lançar material”.
            </p>
          )}
          {necessarios.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{material.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {[
                    material.quantidade,
                    material.valor_centavos != null
                      ? `est. ${formatarBRL(material.valor_centavos)}`
                      : null,
                    material.etapa_id ? nomesEtapas[material.etapa_id] : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "sem detalhes"}
                </p>
              </div>
              {ehAdmin && (
                <div className="flex shrink-0 items-center gap-1">
                  <ComprarMaterial material={material} />
                  <ExcluirMaterial materialId={material.id} descricao={material.descricao} />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comprados */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Comprados{" "}
            <span className="font-normal text-muted-foreground">({comprados.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Data</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="pr-4 text-right">Comprovante</TableHead>
                {ehAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comprados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="p-4 text-center text-muted-foreground">
                    Nenhuma compra registrada.
                  </TableCell>
                </TableRow>
              )}
              {comprados.map((material) => {
                const url = material.comprovante_path
                  ? urlsAssinadas.get(material.comprovante_path)
                  : undefined;
                return (
                  <TableRow key={material.id}>
                    <TableCell className="whitespace-nowrap pl-4 tabular-nums">
                      {material.data ? formatarData(material.data) : "—"}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{material.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {[material.quantidade, material.fornecedor]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {material.valor_centavos != null
                        ? formatarBRL(material.valor_centavos)
                        : "—"}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" /> ver
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {ehAdmin && (
                      <TableCell className="pr-2 text-right">
                        <ExcluirMaterial
                          materialId={material.id}
                          descricao={material.descricao}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
