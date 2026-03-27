import { GoogleGenAI } from '@google/genai';
import { env, hasGeminiApiKey } from '@/src/lib/env';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiServerClient() {
  if (!hasGeminiApiKey()) {
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  return geminiClient;
}
