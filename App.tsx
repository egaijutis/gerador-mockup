import React, { useState } from 'react';
import { AppStep, MockupState } from './types';
import { Button } from './components/Button';
import { ImageUploader } from './components/ImageUploader';
import { StepIndicator } from './components/StepIndicator';
import { generateMockup } from './services/geminiService';

const MOCKUP_TYPES = [
  "Fachada Comercial",
  "Letreiro Interno / Recepção",
  "Envelopamento de Veículo",
  "Uniforme / Vestuário",
  "Papel de Parede / Adesivo",
  "Brindes Personalizados"
];

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_BASE);
  const [state, setState] = useState<MockupState>({
    baseImage: null,
    logoImage: null,
    mockupType: MOCKUP_TYPES[0],
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

  const handleMockupTypeChange = (type: string) => {
    setState(prev => ({ ...prev, mockupType: type }));
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
        state.description,
        state.mockupType
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
      mockupType: MOCKUP_TYPES[0],
      description: '',
      generatedImage: null,
      error: null,
    });
    setStep(AppStep.UPLOAD_BASE);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tighter uppercase">LETRABOX</h1>
          </div>
          <div className="hidden sm:block text-sm text-zinc-400">
            Gerador de Mockups AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          
          <StepIndicator currentStep={step} />

          {/* Card Container */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-10 shadow-2xl min-h-[500px] flex flex-col">
            
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
                    Próximo: Detalhes
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DESCRIPTION & TYPE */}
            {step === AppStep.DESCRIBE && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="bg-zinc-800 p-2 rounded border border-zinc-700">
                        {state.baseImage && <img src={state.baseImage} alt="Base" className="w-12 h-12 object-cover rounded opacity-80" />}
                     </div>
                     <div className="text-zinc-500 font-bold">+</div>
                     <div className="bg-zinc-800 p-2 rounded border border-zinc-700">
                        {state.logoImage && <img src={state.logoImage} alt="Logo" className="w-12 h-12 object-contain opacity-80" />}
                     </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-3">Tipo de Aplicação</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {MOCKUP_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleMockupTypeChange(type)}
                          className={`
                            p-3 text-sm rounded-lg border text-left transition-all
                            ${state.mockupType === type 
                              ? 'bg-orange-500/10 border-orange-500 text-orange-200 ring-1 ring-orange-500/50' 
                              : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'}
                          `}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="block text-white font-semibold mb-2">Instruções de Instalação/Aplicação</span>
                    <textarea 
                      className="w-full h-32 bg-zinc-800 border-2 border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                      placeholder="Descreva detalhes como materiais (ACM, Acrílico, Vinil), acabamento (Brilho, Fosco, LED), posição exata e efeitos desejados."
                      value={state.description}
                      onChange={handleDescriptionChange}
                    />
                  </label>
                  <p className="text-xs text-zinc-500 mt-2 text-right">{state.description.length} caracteres</p>
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
                  <div className="absolute inset-0 border-4 border-zinc-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Processando {state.mockupType}</h3>
                <p className="text-zinc-400 text-center max-w-md">
                  Aplicando texturas, ajustando iluminação e renderizando o resultado final...
                </p>
              </div>
            )}

            {/* STEP 5: RESULT */}
            {step === AppStep.RESULT && state.generatedImage && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-between w-full mb-4">
                    <h3 className="text-xl font-semibold text-white">Resultado Final</h3>
                    <span className="text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded bg-zinc-900/50">
                      {state.mockupType}
                    </span>
                  </div>
                  
                  <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black border border-zinc-700 group">
                    <img 
                      src={state.generatedImage} 
                      alt="Mockup Gerado" 
                      className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                    />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={state.generatedImage} 
                        download="letrabox-mockup.png"
                        className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Baixar
                      </a>
                    </div>
                  </div>
                  <div className="mt-6 bg-zinc-950 p-4 rounded-lg border border-zinc-800 w-full">
                    <p className="text-xs text-zinc-500 uppercase mb-1 font-bold">Instruções Utilizadas</p>
                    <p className="text-zinc-400 text-sm italic">
                      "{state.description}"
                    </p>
                  </div>
                </div>

                <div className="mt-8 w-full flex justify-between">
                  <Button onClick={() => setStep(AppStep.DESCRIBE)} variant="secondary">
                    Ajustar Detalhes
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
      <footer className="py-6 text-center text-zinc-600 text-sm border-t border-zinc-900 bg-zinc-950">
        <p>© {new Date().getFullYear()} Letrabox Comunicação. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;