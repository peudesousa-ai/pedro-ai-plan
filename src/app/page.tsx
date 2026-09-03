import { FormularioLogin } from "@/components/formulario-login";
import { IlustracaoPlanta } from "@/components/ilustracao-planta";

export default function PaginaLogin() {
  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      {/* Hero */}
      <section className="flex flex-col justify-center gap-6 bg-primary px-6 py-10 text-primary-foreground sm:px-10 lg:w-1/2 lg:px-16">
        <p className="text-sm font-medium uppercase tracking-widest opacity-80">
          Lagoa Santa · MG
        </p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Obra da casa
        </h1>
        <p className="max-w-md text-base leading-relaxed opacity-90">
          Acompanhamento da construção: etapas, pagamentos ao pedreiro,
          materiais e relatórios — tudo no lugar do caderno e da planilha.
        </p>
        <IlustracaoPlanta className="mt-4 w-full max-w-sm text-primary-foreground/70" />
      </section>

      {/* Login */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="mb-1 text-xl font-semibold">Entrar</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Use seu CPF e a senha combinada.
          </p>
          <FormularioLogin />
        </div>
      </section>
    </main>
  );
}
