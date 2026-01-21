import { GoogleGenAI } from "@google/genai";

// Helper to strip data URL prefix if present
const cleanBase64 = (dataUrl: string): string => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return matches[2];
  }
  return dataUrl;
};

// Helper to get mime type from data URL
const getMimeType = (dataUrl: string): string => {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (matches && matches.length === 2) {
    return matches[1];
  }
  return 'image/jpeg'; // fallback
};

export const generateMockup = async (
  baseImage: string,
  logoImage: string,
  description: string,
  mockupType: string
): Promise<string> => {
  // 1. Validate API Key first
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.includes("undefined")) {
    throw new Error("Chave de API não configurada. Verifique as variáveis de ambiente na Vercel (API_KEY).");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const base64Base = cleanBase64(baseImage);
    const mimeBase = getMimeType(baseImage);
    
    const base64Logo = cleanBase64(logoImage);
    const mimeLogo = getMimeType(logoImage);

    // Using gemini-2.5-flash-image
    const model = 'gemini-2.5-flash-image';

    const prompt = `
      Atue como um Especialista Sênior em Comunicação Visual e Pós-Produção Fotográfica da Letrabox.
      
      OBJETIVO:
      Criar um mockup ultra-realista aplicando a identidade visual (logotipo) na foto fornecida.
      
      CONTEXTO DO PROJETO:
      Tipo de Aplicação: ${mockupType}
      Instruções Específicas: "${description}"
      
      ENTRADAS:
      1. IMAGEM BASE (Mime: ${mimeBase}): A fotografia do local, veículo, uniforme ou objeto real.
      2. LOGOTIPO (Mime: ${mimeLogo}): A arte a ser aplicada.
      
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
              mimeType: mimeBase, 
              data: base64Base,
            },
          },
          {
            inlineData: {
              mimeType: mimeLogo,
              data: base64Logo,
            },
          },
        ],
      },
    });

    // Handle response extraction
    if (response.candidates && response.candidates.length > 0) {
      // Check for safety finish reason
      const candidate = response.candidates[0];
      if (candidate.finishReason === "SAFETY") {
        throw new Error("A imagem foi bloqueada pelos filtros de segurança da IA. Tente uma imagem base diferente.");
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      // If we got candidates but no image (e.g. text refusal)
      if (candidate.content.parts[0]?.text) {
        console.warn("Model returned text instead of image:", candidate.content.parts[0].text);
        throw new Error(`A IA não gerou uma imagem. Resposta: ${candidate.content.parts[0].text.substring(0, 100)}...`);
      }
    }

    throw new Error("Não foi possível gerar a imagem. Nenhuma resposta válida da IA.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Improve error message for UI
    let message = error.message;
    if (error.status === 400) message = "Erro na requisição (400). Verifique se as imagens não são muito grandes ou corrompidas.";
    if (error.status === 403) message = "Erro de Permissão (403). Verifique sua API Key e se ela tem acesso ao modelo gemini-2.5-flash-image.";
    if (error.status === 429) message = "Muitas requisições (429). Aguarde um momento e tente novamente.";
    if (error.status === 500 || error.status === 503) message = "Erro no servidor da IA (5xx). Tente novamente em instantes.";
    
    throw new Error(message);
  }
};