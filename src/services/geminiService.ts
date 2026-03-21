
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const optimizePrompt = async (prompt: string): Promise<string> => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ottimizza il seguente prompt per ottenere i migliori risultati da un modello AI. Restituisci solo il prompt ottimizzato senza commenti aggiuntivi: "${prompt}"`,
    });
    return response.text || "Errore nell'ottimizzazione";
  } catch (error) {
    console.error("Optimization error:", error);
    return "Errore di connessione all'AI.";
  }
};

export const chatWithGemini = async (message: string, history: {role: string, parts: {text: string}[]}[]) => {
  const ai = getGeminiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Sei un assistente virtuale della suite BCS. Sei professionale, utile e parli in italiano.',
    },
  });
  
  // We don't use the history in the sendMessage call directly per simplified SDK rules if we want simplicity, 
  // but for a real chat we'd pass it. Here we just send the message.
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const generateAppImage = async (prompt: string): Promise<string> => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });
    
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (error) {
    console.error("Image generation error:", error);
    return '';
  }
};
