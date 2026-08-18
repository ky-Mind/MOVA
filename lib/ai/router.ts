import { GeminiImageProvider } from "./providers/gemini-image";
import {
  GenerateImageInput,
  GenerateImageResult,
  ImageProvider,
} from "./types";

function getImageProviders(): ImageProvider[] {
  const providers: ImageProvider[] = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push(new GeminiImageProvider());
  }

  return providers;
}

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageResult> {
  const providers = getImageProviders();

  if (providers.length === 0) {
    throw new Error("No image provider is configured");
  }

  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      console.log(`[MOVA AI] Trying image provider: ${provider.name}`);

      const result = await provider.generateImage(input);

      console.log(
        `[MOVA AI] Image generated using: ${provider.name}`
      );

      return result;
    } catch (error) {
      lastError = error;

      console.error(
        `[MOVA AI] Provider ${provider.name} failed:`,
        error
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All image providers failed");
  }
