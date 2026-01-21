import React, { useState } from 'react';
import { AppStep, MockupState } from './types';
import { Button } from './components/Button';
import { ImageUploader } from './components/ImageUploader';
import { StepIndicator } from './components/StepIndicator';
import { generateMockup } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_BASE);
  const [state, setState] = useState<MockupState>({
    baseImage: null,
    logoImage: null,
    description: '',
    generatedImage: null,
    error: null,
  });

  const handleBaseImageSelect = (base64: string) => {
    setState(prev => ({ ...prev, baseImage: base64, error: null }));
  };

  const handleLogoSelect = (base64: string) => {
    setState(prev => ({ ...prev, logoImage: base64, error: null }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, description: e.target.value }));
  };

  const handleNext = () => {
    if (step === AppStep.UPLOAD_BASE && state.baseImage) {
      setStep(AppStep.UPLOAD_LOGO);
    } else if (step === AppStep.UPLOAD_LOGO && state.logoImage) {
      setStep(AppStep.DESCRIBE);
    }
  };

  const handleBack = () => {
    if (step > AppStep.UPLOAD_BASE && step !== AppStep.GENERATING) {
      setStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    if (!state.baseImage || !state.logoImage || !state.description) return;

    setStep(AppStep.GENERATING);
    setState(prev => ({ ...prev, error: null }));

    try {
      const resultImage = await generateMockup(
        state.baseImage, 
        state.logoImage, 
        state.description
      );
      
      setState(prev => ({ ...prev, generatedImage: resultImage }));
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        error: "Ocorreu um erro ao gerar o mockup. Tente simplificar a descrição ou usar imagens menores." 
      }));
      setStep(AppStep.DESCRIBE);
    }
  };

  const handleReset = () => {
    setState({
      baseImage: null,
      logoImage: null,
      description: '',
      generatedImage: null,
      error: null,
    });
    setStep(AppStep.UPLOAD_BASE);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">
               L
             </div>
             <div>
               <h1 className="text-xl font-bold text-white tracking-tight">letrabox</h1>
               <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Visual Intelligence</p>
             </div>
          </div>
          <div className="hidden sm:block text-sm text-slate-400">
            Gerador de Mockups AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          
          <StepIndicator currentStep={step} />

          {/* Card Container */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-10 shadow-2xl min-h-[500px] flex flex-col">
            
            {/* Error Message */}
            {state.error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{state.error}</p>
              </div>
            )}

            {/* STEP 1: BASE IMAGE */}
            {step === AppStep.UPLOAD_BASE && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <ImageUploader 
                  label="Foto do Local ou Objeto"
                  subLabel="Envie a foto da fachada, veículo, parede ou uniforme onde aplicaremos a arte."
                  onImageSelected={handleBaseImageSelect}
                  currentImage={state.baseImage}
                />
                <div className="mt-8 w-full flex justify-end">
                  <Button 
                    onClick={handleNext} 
                    disabled={!state.baseImage}
                    className="w-full sm:w-auto"
                  >
                    Próximo: Enviar Logo
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: LOGO IMAGE */}
            {step === AppStep.UPLOAD_LOGO && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <ImageUploader 
                  label="Seu Logotipo"
                  subLabel="Envie o arquivo do logotipo (preferencialmente PNG com fundo transparente)."
                  onImageSelected={handleLogoSelect}
                  currentImage={state.logoImage}
                />
                <div className="mt-8 w-full flex justify-between gap-4">
                  <Button onClick={handleBack} variant="secondary">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!state.logoImage}
                  >
                    Próximo: Descrever
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DESCRIPTION */}
            {step === AppStep.DESCRIBE && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Descreva a Aplicação</h3>
                  <p className="text-slate-400 mb-6">Como o logotipo deve ser aplicado? Detalhe materiais, iluminação e posição.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-2">Imagem Base</p>
                      {state.baseImage && <img src={state.baseImage} alt="Base" className="h-32 object-contain mx-auto opacity-70" />}
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-2">Logotipo</p>
                      {state.logoImage && <img src={state.logoImage} alt="Logo" className="h-32 object-contain mx-auto opacity-70" />}
                    </div>
                  </div>

                  <label className="block">
                    <textarea 
                      className="w-full h-32 bg-slate-800 border-2 border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                      placeholder="Ex: Fachada em ACM preto fosco com o logotipo centralizado em acrílico com iluminação interna (backlight). Manter o reflexo dos vidros."
                      value={state.description}
                      onChange={handleDescriptionChange}
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-2 text-right">{state.description.length} caracteres</p>
                </div>

                <div className="mt-8 w-full flex justify-between gap-4">
                  <Button onClick={handleBack} variant="secondary">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!state.description.trim()}
                    className="w-full sm:w-auto"
                  >
                    Gerar Mockup
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: GENERATING (LOADING) */}
            {step === AppStep.GENERATING && (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Criando seu Mockup</h3>
                <p className="text-slate-400 text-center max-w-md">
                  Nossa IA (Nano Banana) está analisando a estrutura, iluminação e perspectiva para aplicar sua marca...
                </p>
              </div>
            )}

            {/* STEP 5: RESULT */}
            {step === AppStep.RESULT && state.generatedImage && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h3 className="text-xl font-semibold text-white mb-4 self-start">Resultado</h3>
                  <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-700 group">
                    <img 
                      src={state.generatedImage} 
                      alt="Mockup Gerado" 
                      className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                    />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={state.generatedImage} 
                        download="letrabox-mockup.png"
                        className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Baixar
                      </a>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-4 italic text-center max-w-2xl">
                    "{state.description}"
                  </p>
                </div>

                <div className="mt-8 w-full flex justify-between">
                  <Button onClick={() => setStep(AppStep.DESCRIBE)} variant="secondary">
                    Refazer Prompt
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    Novo Projeto
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-600 text-sm border-t border-slate-900 bg-slate-950">
        <p>© {new Date().getFullYear()} Letrabox Comunicação. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;