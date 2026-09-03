/** Tipos das linhas do banco. Espelham supabase/migrations/0001_schema.sql. */

export type Papel = "admin" | "visualizador";
export type GrupoEtapa = "fundacao_estrutura" | "vedacao_cobertura" | "acabamento";
export type OrigemEtapa = "contrato" | "aditivo";
export type TipoPagamento = "mao_de_obra" | "aditivo";
export type StatusMaterial = "comprado" | "necessario";

export const NOMES_GRUPOS: Record<GrupoEtapa, string> = {
  fundacao_estrutura: "Fundação e estrutura",
  vedacao_cobertura: "Vedação e cobertura",
  acabamento: "Acabamento",
};

export interface Perfil {
  id: string;
  nome: string;
  cpf: string;
  papel: Papel;
}

export interface Etapa {
  id: string;
  nome: string;
  grupo: GrupoEtapa;
  valor_orcado_centavos: number;
  percentual_concluido: number;
  ordem: number;
  valor_rateado: boolean;
  origem: OrigemEtapa;
  observacao: string | null;
  data_inicio: string | null;
  data_conclusao: string | null;
}

export interface EtapaHistorico {
  id: string;
  etapa_id: string;
  percentual_anterior: number;
  percentual_novo: number;
  autor: string | null;
  nota: string | null;
  criado_em: string;
}

export interface Pagamento {
  id: string;
  data: string;
  valor_centavos: number;
  tipo: TipoPagamento;
  pago_por: string | null;
  observacao: string | null;
  comprovante_path: string | null;
}

export interface Material {
  id: string;
  data: string | null;
  descricao: string;
  fornecedor: string | null;
  valor_centavos: number | null;
  quantidade: string | null;
  status: StatusMaterial;
  etapa_id: string | null;
  pago_por: string | null;
  comprovante_path: string | null;
}

export interface Relatorio {
  id: string;
  periodo_inicio: string;
  periodo_fim: string;
  snapshot: SnapshotRelatorio;
  gerado_em: string;
  gerado_por: string | null;
  token_publico: string;
  aceito_em: string | null;
  aceito_por: string | null;
  assinatura_nome: string | null;
}

export interface Configuracoes {
  valor_contrato_centavos: number;
  data_alvo: string | null;
  nome_responsavel_obra: string;
}

/** Conteúdo congelado do relatório no momento da geração. */
export interface SnapshotRelatorio {
  periodo_inicio: string;
  periodo_fim: string;
  etapas_concluidas_no_periodo: { nome: string; valor_orcado_centavos: number }[];
  etapas_em_andamento: {
    nome: string;
    percentual_concluido: number;
    valor_orcado_centavos: number;
  }[];
  pagamentos_no_periodo: { data: string; valor_centavos: number; tipo: TipoPagamento }[];
  materiais_no_periodo: { data: string; descricao: string; valor_centavos: number }[];
  total_pago_periodo_centavos: number;
  total_materiais_periodo_centavos: number;
  acumulado: {
    valor_contrato_centavos: number;
    total_pago_centavos: number;
    valor_entregue_centavos: number;
    adiantamento_centavos: number;
    avanco_fisico_ponderado: number;
    avanco_financeiro: number;
    saldo_a_pagar_centavos: number;
    total_materiais_centavos: number;
  };
}
