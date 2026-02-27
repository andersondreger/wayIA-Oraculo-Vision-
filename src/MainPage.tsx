import {GoogleGenAI, Type} from '@google/genai';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Accept, useDropzone} from 'react-dropzone';
import {cn} from './lib/utils';
import {Action, AnalysisResult, RiskProfile} from './types';
import {RiskProfileSelector} from './components/RiskProfileSelector';
import {AnalysisDisplay} from './components/AnalysisDisplay';
import {BotIcon, UploadIcon} from './components/icons';

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

const acceptedFileTypes: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export default function MainPage() {
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey.length > 5) {
      try {
        const genAI = new GoogleGenAI({apiKey});
        setAi(genAI);
      } catch (e) {
        console.error('Gemini AI initialization error:', e);
        setInitializationError(
          'Falha ao inicializar a API do Gemini. Verifique se a chave é válida.',
        );
      }
    } else {
      setInitializationError(
        'A chave da API do Gemini não foi encontrada. Por favor, configure a variável de ambiente VITE_GEMINI_API_KEY nas configurações de deploy do seu projeto no Cloudflare Pages.',
      );
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const [riskProfile, setRiskProfile] = useState<RiskProfile>(
    RiskProfile.Moderado,
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeImage = async (file: File) => {
    if (!ai) {
      setAnalysisError('A instância da IA não foi inicializada.');
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const base64File = await fileToBase64(file);
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64File,
              },
            },
            {
              text: `Você é o motor de inteligência artificial do sistema "Oráculo Vision". Sua especialidade é análise técnica avançada e visão computacional aplicada a gráficos financeiros.
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
              
              Retorne sua análise estritamente no formato JSON definido.`,
            },
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

      const result = JSON.parse(response.text) as AnalysisResult;
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalysisError(
        'Ocorreu um erro ao analisar a imagem. Tente novamente mais tarde.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        analyzeImage(file);
      }
    },
    accept: acceptedFileTypes,
    maxFiles: 1,
  });

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const renderContent = () => {
    if (initializationError) {
      return (
        <div className="md:col-span-2 bg-destructive/10 border border-destructive text-destructive-foreground p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold mb-2">Erro de Configuração</h2>
          <p className="max-w-md">{initializationError}</p>
        </div>
      );
    }

    if (!ai) {
      return (
        <div className="md:col-span-2 flex items-center justify-center p-8">
           <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Inicializando a IA...</span>
            </div>
        </div>
      );
    }

    return (
       <>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">1. Enviar Gráfico para Análise</h2>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer transition-colors',
              'hover:border-primary hover:bg-primary/10',
              isDragActive && 'border-primary bg-primary/10',
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <UploadIcon className="w-12 h-12" />
              {isDragActive ? (
                <p>Solte o arquivo aqui...</p>
              ) : (
                <p>Arraste e solte o arquivo aqui, ou clique para selecionar</p>
              )}
              <p className="text-sm">PNG, JPG, WEBP</p>
            </div>
          </div>
          {preview && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Pré-visualização:</h3>
              <img
                src={preview}
                alt="Pré-visualização do gráfico"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">2. Resultado da Análise</h2>
          <AnalysisDisplay
            result={analysisResult}
            isLoading={isLoading}
            errorMessage={analysisError}
          />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
