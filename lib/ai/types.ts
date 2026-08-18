export type ImageAspectRatio =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4";

export interface GenerateImageInput {
  prompt: string;
  aspectRatio: ImageAspectRatio;
  referenceImages?: string[];
}

export interface GenerateImageResult {
  imageData: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  provider: string;
}

export interface ImageProvider {
  name: string;

  generateImage(
    input: GenerateImageInput
  ): Promise<GenerateImageResult>;
}
