"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarBRL, formatarDataCurta } from "@/lib/formato";

/** Rótulo curto do eixo Y ("45 mil"), para não quebrar em duas linhas no celular. */
function formatarTickEixo(valorCentavos: number): string {
  const reais = valorCentavos / 100;
  if (reais === 0) return "0";
  if (Math.abs(reais) >= 1000) {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(reais / 1000)} mil`;
  }
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(reais);
}

const COR_SERIE = "#2a78d6";
const COR_GRADE = "#e1e0d9";
const COR_EIXO = "#898781";

interface Ponto {
  data: string;
  acumuladoCentavos: number;
}

function TooltipCurva({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Ponto }[];
}) {
  if (!active || !payload?.length) return null;
  const ponto = payload[0].payload;
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{formatarDataCurta(ponto.data)}</p>
      <p className="text-muted-foreground">
        Acumulado: <span className="font-medium text-foreground">{formatarBRL(ponto.acumuladoCentavos)}</span>
      </p>
    </div>
  );
}

export function GraficoCurvaDesembolso({ pontos }: { pontos: Ponto[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Curva de desembolso acumulado ao pedreiro ao longo do tempo">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pontos} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="preenchimento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COR_SERIE} stopOpacity={0.25} />
              <stop offset="100%" stopColor={COR_SERIE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COR_GRADE} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="data"
            tickFormatter={formatarDataCurta}
            tick={{ fontSize: 11, fill: COR_EIXO }}
            tickLine={false}
            axisLine={{ stroke: COR_GRADE }}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={formatarTickEixo}
            tick={{ fontSize: 11, fill: COR_EIXO }}
            tickLine={false}
            axisLine={false}
            width={54}
          />
          <Tooltip content={<TooltipCurva />} cursor={{ stroke: COR_EIXO, strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="acumuladoCentavos"
            stroke={COR_SERIE}
            strokeWidth={2}
            fill="url(#preenchimento)"
            activeDot={{ r: 4 }}
            animationDuration={450}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
