import { cn } from "@/lib/utils";

/**
 * Cabeçalho padrão das telas: título e ação na primeira linha, descrição
 * ocupando a largura toda abaixo — assim o texto nunca corre por baixo do botão.
 */
export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {titulo}
        </h1>
        {acao && <div className="shrink-0">{acao}</div>}
      </div>
      {descricao && (
        <p className="text-sm leading-snug text-muted-foreground">{descricao}</p>
      )}
    </div>
  );
}
