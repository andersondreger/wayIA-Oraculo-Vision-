import {AnalysisResult} from '../types';

export function AnalysisDisplay({result, isLoading, error}: {result: AnalysisResult | null; isLoading: boolean, error: string | null}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Analisando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (result?.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive text-center">{result.error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-center">
          Aguardando imagem para análise.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 font-sans">
      <div className="text-center">
        <p className="font-bold text-lg">💳 ORÁCULO VISION: DECISÃO</p>
        <p className="text-sm text-muted-foreground">
          {result.ativo} | {result.timeframe}
        </p>
      </div>

      <div className="text-center py-4">
        <p className={`text-3xl font-bold`}>
          {result.acao}
        </p>
        <p className="font-mono text-lg text-primary/80">
          Confiança: {result.confianca}%
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Justificativa:</h4>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
          {result.justificativa.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div
        className={'border rounded-lg text-center p-3 mt-4 transition-all'}
      >
        <p className="font-mono text-lg font-bold text-primary">
          {`⏱️ CLIQUE EM: ${result.cliqueEm} segundos.`}
        </p>
      </div>
    </div>
  );
}
