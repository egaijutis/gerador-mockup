import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip data URL prefix if present
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
  description: string,
  mockupType: string
): Promise<string> => {
  try {
    const base64Base = cleanBase64(baseImage);
    const base64Logo = cleanBase64(logoImage);

    // Using gemini-2.5-flash-image (nano banana) as requested
    const model = 'gemini-2.5-flash-image';

    const prompt = `
      Atue como um Especialista Sênior em Comunicação Visual e Pós-Produção Fotográfica da Letrabox.
      
      OBJETIVO:
      Criar um mockup ultra-realista aplicando a identidade visual (logotipo) na foto fornecida.
      
      CONTEXTO DO PROJETO:
      Tipo de Aplicação: ${mockupType}
      Instruções Específicas: "${description}"
      
      ENTRADAS:
      1. IMAGEM BASE: A fotografia do local, veículo, uniforme ou objeto real.
      2. LOGOTIPO: A arte a ser aplicada.
      
      DIRETRIZES TÉCNICAS (EXTREMA IMPORTÂNCIA):
      1. FOTORREALISMO ABSOLUTO: O resultado NÃO pode parecer uma ilustração 3D ou desenho. Deve parecer uma fotografia tirada após a instalação do serviço.
      2. PRESERVAÇÃO DA CENA: Mantenha a iluminação original, o grão da foto, o balanço de cores e o ambiente ao redor intactos.
      3. PERSPECTIVA E GEOMETRIA: O logotipo deve respeitar rigorosamente a perspectiva, curvatura e textura da superfície de aplicação (ex: dobras do tecido no uniforme, curvas da lataria do carro, ângulo da parede).
      4. MATERIALIDADE: Simule as propriedades do material descrito (ex: brilho do acrílico, fosco do ACM, textura do tecido, reflexo do vidro).
      5. INTEGRAÇÃO: O logotipo deve ter sombras projetadas e receber a iluminação do ambiente corretamente.
      
      Saída esperada: Apenas a imagem final tratada.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg', 
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