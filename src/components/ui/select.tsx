import * as React from "react";
import { cn } from "@/lib/utils";

/** Select nativo estilizado — mais simples e melhor no celular que um dropdown customizado. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "seta-select flex h-10 w-full appearance-none rounded-lg border border-input bg-card px-3.5 py-2 pr-10 text-base shadow-sm transition-all duration-200 hover:border-primary/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
