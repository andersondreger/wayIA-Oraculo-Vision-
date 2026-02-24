import {GoogleGenAI, Type} from '@google/genai';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Accept, useDropzone} from 'react-dropzone';
import {cn} from './lib/utils';
import {Action, AnalysisResult, RiskProfile} from './types';
import {BotIcon, UploadIcon} from './components/icons';

// Initialize GoogleGenAI
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// Function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export default function MainPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const [riskProfile, setRiskProfile] = useState<RiskProfile>(
    RiskProfile.Moderado,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptConfig: Accept = {
    'image/*': ['.png', '.jpeg', '.jpg', '.webp'],
  };

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: acceptConfig,
    maxFiles: 1,
    multiple: false,
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setLoading(true);

      try {
        const base64Image = await fileToBase64(file);

        const textualPrompt = `Você é o motor de inteligência artificial do sistema "Oráculo Vision". Sua especialidade é análise técnica avançada e visão computacional aplicada a gráficos financeiros.
        Analise a imagem do gráfico financeiro fornecida.
        
        Siga o protocolo obrigatório:
        1.  **Identifique Ativo e Timeframe:** Ex: EUR/USD, M1, M5.
        2.  **Analise Padrões de Candles:** Detecte força vendedora/compradora, martelos, engolfos, suportes e resistências.
        3.  **Extraia Indicadores:** Se houver indicadores como RSI, Médias Móveis, ou Bandas de Bollinger, leia seus valores.
        4.  **Calcule o Delay de Entrada:**
            -   30s: Alta volatilidade (velas longas).
            -   38s - 42s: Tendência clara e constante.
            -   48s: Mercado lateral ou baixa liquidez.
        5.  **Determine a Ação e Confiança:** Com base na análise, decida entre COMPRA, VENDA ou AGUARDAR. A confiança deve ser calculada com base na confluência de sinais.
        
        **Contexto do Usuário (Perfil de Risco): ${riskProfile}**
        -   Conservador: Exija confluência > 90% para um sinal.
        -   Moderado: Exija confluência > 80% para um sinal.
        -   Agressivo: Exija confluência > 70% para um sinal.
        
        Retorne sua análise estritamente no formato JSON definido.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Image,
                },
              },
              {text: textualPrompt},
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ativo: {type: Type.STRING},
                timeframe: {type: Type.STRING},
                acao: {
                  type: Type.STRING,
                  enum: [Action.Compra, Action.Venda, Action.Aguardar],
                },
                confianca: {type: Type.NUMBER},
                justificativa: {
                  type: Type.ARRAY,
                  items: {type: Type.STRING},
                },
                cliqueEm: {type: Type.NUMBER},
              },
              required: [
                'ativo',
                'timeframe',
                'acao',
                'confianca',
                'justificativa',
                'cliqueEm',
              ],
            },
          },
        });

        const analysisResult = JSON.parse(response.text) as AnalysisResult;
        setResult(analysisResult);
      } catch (e) {
        console.error(e);
        setError(
          'Falha ao analisar a imagem. Verifique o formato ou tente novamente.',
        );
      } finally {
        setLoading(false);
      }
    },
  } as any);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="flex flex-col sm:flex-row justify-between items-center pb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <BotIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Oráculo Vision</h1>
          </div>
          <div className="flex items-center gap-4">
            <RiskProfileSelector
              selectedProfile={riskProfile}
              onSelectProfile={setRiskProfile}
            />
            <button
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">1. Enviar Gráfico para Análise</h2>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors',
                'hover:border-primary/70',
                isDragActive && 'border-primary bg-primary/10',
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <UploadIcon className="w-10 h-10" />
                {isDragActive ? (
                  <p>Solte a imagem aqui...</p>
                ) : (
                  <p>Arraste e solte a imagem ou clique para selecionar</p>
                )}
              </div>
            </div>
            {preview && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Pré-visualização:</h3>
                <img
                  src={preview}
                  alt="Preview do gráfico enviado"
                  className="rounded-lg w-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">2. Resultado da Operação</h2>
            <div className="bg-card border border-border rounded-lg p-6 min-h-[300px] flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span>Analisando...</span>
                </div>
              ) : error ? (
                <p className="text-destructive text-center">{error}</p>
              ) : result ? (
                <ResultCard result={result} />
              ) : (
                <p className="text-muted-foreground text-center">
                  Aguardando imagem para análise.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function RiskProfileSelector({
  selectedProfile,
  onSelectProfile,
}: {
  selectedProfile: RiskProfile;
  onSelectProfile: (profile: RiskProfile) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-secondary">
      {Object.values(RiskProfile).map((profile) => (
        <button
          key={profile}
          onClick={() => onSelectProfile(profile)}
          className={cn(
            'px-4 py-1.5 text-sm font-semibold rounded-full transition-colors',
            selectedProfile === profile
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-primary/10',
          )}
        >
          {profile}
        </button>
      ))}
    </div>
  );
}

function ResultCard({result}: {result: AnalysisResult}) {
  const [countdown, setCountdown] = useState(result.cliqueEm);

  useEffect(() => {
    setCountdown(result.cliqueEm); // Reset countdown when result changes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [result]);

  const actionConfig = {
    [Action.Compra]: {
      label: 'COMPRA',
      color: 'text-green-400',
      icon: '🟢',
    },
    [Action.Venda]: {
      label: 'VENDA',
      color: 'text-red-400',
      icon: '🔴',
    },
    [Action.Aguardar]: {
      label: 'AGUARDAR',
      color: 'text-gray-400',
      icon: '⚪',
    },
  };

  const currentAction = actionConfig[result.acao];

  return (
    <div className="w-full flex flex-col gap-4 font-sans">
      <div className="text-center">
        <p className="font-bold text-lg">💳 ORÁCULO VISION: DECISÃO</p>
        <p className="text-sm text-muted-foreground">
          {result.ativo} | {result.timeframe}
        </p>
      </div>

      <div className="text-center py-4">
        <p className={`text-3xl font-bold ${currentAction.color}`}>
          {currentAction.icon} {currentAction.label}
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
        className={cn(
          'border rounded-lg text-center p-3 mt-4 transition-all',
          countdown > 0
            ? 'bg-secondary/50 border-border'
            : 'bg-primary/20 border-primary',
        )}
      >
        <p className="font-mono text-lg font-bold text-primary">
          {countdown > 0 ? (
            `⏱️ CLIQUE EM: ${countdown} segundos.`
          ) : (
            '⏱️ TEMPO ESGOTADO!'
          )}
        </p>
      </div>
    </div>
  );
}
