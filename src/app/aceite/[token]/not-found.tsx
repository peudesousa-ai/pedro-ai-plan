import { FileQuestion } from "lucide-react";

/** Token inválido ou relatório removido — mensagem clara para quem recebeu o link. */
export default function AceiteNaoEncontrado() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="rounded-2xl bg-accent p-4 text-accent-foreground">
          <FileQuestion className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Relatório não encontrado</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Este link não é válido ou o relatório foi removido. Peça um link novo a
          quem enviou.
        </p>
      </div>
    </main>
  );
}
