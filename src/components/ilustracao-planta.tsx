/** Ilustração em linha de uma planta baixa — sóbria, no tom do tema. */
export function IlustracaoPlanta({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="2.5">
        {/* contorno externo */}
        <path d="M20 30 H300 V210 H20 Z" />
        {/* varanda */}
        <path d="M20 160 H100 V210" strokeDasharray="6 5" strokeWidth="1.8" />
        {/* parede central vertical */}
        <path d="M170 30 V110" />
        <path d="M170 140 V210" />
        {/* parede horizontal ala direita */}
        <path d="M170 110 H240" />
        <path d="M262 110 H300" />
        {/* quarto superior direito */}
        <path d="M232 30 V80" />
        {/* banheiro */}
        <path d="M232 60 H300" strokeWidth="1.8" />
        {/* cozinha / sala divisão */}
        <path d="M100 160 H170" strokeWidth="1.8" />
        {/* portas (arcos) */}
        <path d="M170 118 A22 22 0 0 1 192 140" strokeWidth="1.5" />
        <path d="M240 110 A20 20 0 0 0 260 90" strokeWidth="1.5" />
      </g>
      {/* janelas */}
      <g stroke="currentColor" strokeWidth="5" opacity="0.45">
        <path d="M60 30 H110" />
        <path d="M200 210 H250" />
        <path d="M300 150 V180" />
        <path d="M20 70 V100" />
      </g>
      {/* cotas */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.35">
        <path d="M20 224 H300" />
        <path d="M20 219 V229" />
        <path d="M300 219 V229" />
        <path d="M312 30 V210" />
        <path d="M307 30 H317" />
        <path d="M307 210 H317" />
      </g>
    </svg>
  );
}
