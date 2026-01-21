import React, { useRef, useState } from 'react';
import { Button } from './Button';

interface ImageUploaderProps {
  label: string;
  subLabel?: string;
  onImageSelected: (base64: string) => void;
  currentImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  subLabel, 
  onImageSelected, 
  currentImage 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-white mb-2">{label}</h3>
      {subLabel && <p className="text-zinc-400 mb-4 text-sm">{subLabel}</p>}
      
      <div 
        className={`
          relative w-full h-64 sm:h-80 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-200
          ${dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {currentImage ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg group">
            <img 
              src={currentImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain shadow-lg" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Button onClick={() => inputRef.current?.click()} variant="outline">
                 Trocar Imagem
               </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-zinc-300 font-medium mb-1">Arraste e solte sua imagem aqui</p>
            <p className="text-zinc-500 text-sm mb-4">ou clique para buscar nos arquivos</p>
            <Button onClick={() => inputRef.current?.click()} variant="secondary">
              Selecionar Arquivo
            </Button>
          </div>
        )}
        
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
};