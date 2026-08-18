import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const prompt = String(form.get("prompt") || "").trim();
    const aspect = String(form.get("aspectRatio") || "9:16");
    const negativePrompt = String(form.get("negativePrompt") || "");
    const files = form.getAll("files").filter((x): x is File => x instanceof File);
    if (!prompt) return NextResponse.json({ error: "Prompt kosong." }, { status: 400 });
    const ai = gemini();
    const image = files.find(f => f.type.startsWith("image/"));
    const config: any = { aspectRatio: aspect, numberOfVideos: 1, ...(negativePrompt ? { negativePrompt } : {}) };
    const args: any = { model: "veo-3.1-generate-preview", prompt, config };
    if (image) args.image = { imageBytes: Buffer.from(await image.arrayBuffer()).toString("base64"), mimeType: image.type };
    const operation = await ai.models.generateVideos(args);
    return NextResponse.json({ operation: operation.name, message: "Video generation dimulai." });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Video generation error" }, { status: 500 });
  }
}
