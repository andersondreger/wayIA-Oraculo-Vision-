import {GoogleGenAI} from '@google/genai';
import React, {useEffect, useState} from 'react';
import {BotIcon} from './components/icons';

export default function MainPage() {
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Use a small delay to ensure the UI renders before this heavy operation
    const timer = setTimeout(() => {
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
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
      <div className="md:col-span-2 text-center">
        <h2 className="text-2xl font-bold text-green-500 mb-2">Sucesso!</h2>
        <p className="max-w-md mx-auto">
          A instância da IA foi inicializada corretamente. Agora você pode restaurar a funcionalidade de upload de arquivos.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="flex flex-col sm:flex-row justify-between items-center pb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <BotIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Oráculo Vision</h1>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
