export enum RiskProfile {
  Conservador = 'Conservador',
  Moderado = 'Moderado',
  Agressivo = 'Agressivo',
}

export enum Action {
  Compra = 'COMPRA',
  Venda = 'VENDA',
  Aguardar = 'AGUARDAR',
}

export interface AnalysisResult {
  ativo: string;
  timeframe: string;
  acao: Action;
  confianca: number;
  justificativa: string[];
  cliqueEm: number;
}
