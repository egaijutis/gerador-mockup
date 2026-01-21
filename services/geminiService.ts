import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip data URL prefix if present, though SDK often handles both.
// However, the SDK examples usually pass raw base64 or complete data URI for inlineData.
const cleanBase64 = (dataUrl: string): string => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return matches[2];
  }
  return dataUrl;
};

export const generateMockup = async (
  baseImage: string,
  logoImage: string,
  description: string
): Promise<string> => {
  try {
    const base64Base = cleanBase64(baseImage);
    const base64Logo = cleanBase64(logoImage);

    // Using gemini-2.5-flash-image (nano banana) as requested
    const model = 'gemini-2.5-flash-image';

    const prompt = `
      Atue como um designer especialista em comunicação visual da Letrabox.
      
      Tarefa: Crie um mockup fotorrealista combinando as imagens fornecidas.
      
      Entradas:
      1. Primeira Imagem: A foto do local/objeto original (fachada, veículo, etc).
      2. Segunda Imagem: O logotipo da marca a ser aplicada.
      3. Instrução: "${description}"
      
      Diretrizes:
      - APLIQUE o logotipo na superfície da primeira imagem conforme a instrução.
      - MANTENHA a perspectiva, iluminação e sombras da primeira imagem para parecer real.
      - NÃO altere drasticamente o cenário ao redor, apenas faça a intervenção de comunicação visual.
      - O resultado deve parecer uma foto real de um trabalho concluído.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, API is forgiving with standard image mimes
              data: base64Base,
            },
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Logo,
            },
          },
        ],
      },
    });

    // Handle response extraction
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Não foi possível gerar a imagem. Nenhuma imagem retornada pelo modelo.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};