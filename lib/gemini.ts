import { GoogleGenAI } from "@google/genai";

export function gemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diatur. Buat API key di Google AI Studio lalu masukkan ke .env.local atau Vercel Environment Variables.");
  return new GoogleGenAI({ apiKey });
}
