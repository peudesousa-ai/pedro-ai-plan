import * as React from "react";
import { cn } from "@/lib/utils";

function Progress({
  value = 0,
  className,
  indicadorClassName,
  ...props
}: React.ComponentProps<"div"> & { value?: number; indicadorClassName?: string }) {
  const limitado = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={limitado}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn("h-full bg-primary transition-all", indicadorClassName)}
        style={{ width: `${limitado}%` }}
      />
    </div>
  );
}

export { Progress };
