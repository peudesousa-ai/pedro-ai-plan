import { ListChecks, Wallet, Package, FileText } from "lucide-react";
import { FormularioLogin } from "@/components/formulario-login";
import { IlustracaoPlanta } from "@/components/ilustracao-planta";

const destaques = [
  { icone: ListChecks, rotulo: "Etapas" },
  { icone: Wallet, rotulo: "Pagamentos" },
  { icone: Package, rotulo: "Materiais" },
  { icone: FileText, rotulo: "Relatórios" },
];

export default function PaginaLogin() {
  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      {/* Hero */}
      <section className="relative flex flex-col justify-center gap-7 overflow-hidden bg-hero px-6 py-14 text-primary-foreground sm:px-10 lg:w-[54%] lg:px-16 lg:py-10">
        {/* brilho quente e sutil no canto — sóbrio, sem gradiente genérico */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-hero-brilho opacity-60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-24 h-[24rem] w-[24rem] rounded-full bg-primary opacity-15 blur-3xl"
        />

        <div className="relative flex flex-col gap-6">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground/70">
            <span aria-hidden="true" className="h-px w-8 bg-primary-foreground/40" />
            Lagoa Santa · MG
          </p>
          <h1 className="max-w-xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            A obra da casa,
            <br />
            <span className="text-[oklch(0.78_0.11_55)]">sob controle.</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            Etapas, pagamentos ao pedreiro, materiais e relatórios com aceite
            formal — tudo no lugar do caderno e da planilha.
          </p>

          <ul className="flex flex-wrap gap-2.5">
            {destaques.map(({ icone: Icone, rotulo }) => (
              <li
                key={rotulo}
                className="flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3.5 py-1.5 text-sm text-primary-foreground/85 backdrop-blur-sm"
              >
                <Icone className="h-4 w-4" aria-hidden="true" />
                {rotulo}
              </li>
            ))}
          </ul>

          <IlustracaoPlanta className="mt-2 w-full max-w-md text-[oklch(0.78_0.11_55)]/60" />
        </div>
      </section>

      {/* Login */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-card p-7 shadow-md sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
          <p className="mb-7 mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Use seu CPF e a senha combinada.
          </p>
          <FormularioLogin />
        </div>
      </section>
    </main>
  );
}
