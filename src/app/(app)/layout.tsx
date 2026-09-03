import { LogOut } from "lucide-react";
import { exigirPerfil } from "@/lib/sessao";
import { sair } from "@/app/(auth)/actions";
import { Navegacao } from "@/components/navegacao";
import { Button } from "@/components/ui/button";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const perfil = await exigirPerfil();

  return (
    <div className="min-h-dvh bg-background">
      <header className="nao-imprimir sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 lg:pl-60">
        <div>
          <p className="text-sm font-semibold leading-tight">Obra Lagoa Santa</p>
          <p className="text-xs text-muted-foreground">Olá, {perfil.nome.split(" ")[0]}</p>
        </div>
        <form action={sair}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </header>
      <Navegacao />
      <main className="px-4 pb-24 pt-4 sm:px-6 lg:pb-8 lg:pl-62">{children}</main>
    </div>
  );
}
