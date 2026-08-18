import { GoogleGenAI } from "@google/genai";
import {
  GenerateImageInput,
  GenerateImageResult,
  ImageProvider,
} from "../types";

export class GeminiImageProvider implements ImageProvider {
  name = "gemini";

  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  async generateImage(
    input: GenerateImageInput
  ): Promise<GenerateImageResult> {
    const response = await this.client.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: input.prompt,
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: input.aspectRatio,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          imageData: part.inlineData.data,
          mimeType: "image/jpeg",
          provider: this.name,
        };
      }
    }

    throw new Error("Gemini did not return an image");
  }
}
