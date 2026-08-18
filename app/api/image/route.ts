import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/ai/router";
import { ImageAspectRatio } from "@/lib/ai/types";

export const runtime = "nodejs";

const VALID_ASPECT_RATIOS: ImageAspectRatio[] = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const aspectRatio: ImageAspectRatio =
      VALID_ASPECT_RATIOS.includes(body.aspectRatio)
        ? body.aspectRatio
        : "9:16";

    if (!prompt) {
      return NextResponse.json(
        {
          error: "Prompt is required",
        },
        {
          status: 400,
        }
      );
    }

    const result = await generateImage({
      prompt,
      aspectRatio,
      referenceImages: Array.isArray(body.referenceImages)
        ? body.referenceImages
        : [],
    });

    const imageBuffer = Buffer.from(
      result.imageData,
      "base64"
    );

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition":
          'inline; filename="mova-generated-image.jpg"',
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[MOVA IMAGE API]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Image generation failed";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
