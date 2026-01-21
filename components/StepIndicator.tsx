import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.UPLOAD_BASE, label: 'Ambiente' },
    { id: AppStep.UPLOAD_LOGO, label: 'Logotipo' },
    { id: AppStep.DESCRIBE, label: 'Instruções' },
    { id: AppStep.RESULT, label: 'Resultado' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded"></div>
        
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isGenerating = currentStep === AppStep.GENERATING && step.id === AppStep.RESULT;

          let circleClass = "bg-slate-800 border-2 border-slate-600 text-slate-400";
          if (isActive || isGenerating) circleClass = "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30";
          if (isCompleted) circleClass = "bg-green-500 border-green-500 text-white";

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${circleClass}`}>
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};