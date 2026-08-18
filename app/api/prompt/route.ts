import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const prompt = String(form.get("prompt") || "").trim();
    const mode = String(form.get("mode") || "image");
    const aspect = String(form.get("aspectRatio") || "9:16");
    const files = form.getAll("files").filter((x): x is File => x instanceof File);
    if (!prompt) return NextResponse.json({ error: "Prompt kosong." }, { status: 400 });

    const ai = gemini();
    const inputs: any[] = [{ text: `You are a professional creative director for an AI image/video generator. Rewrite the user's idea into one production-ready prompt. Preserve the user's intent. Include subject, action, environment, composition, camera, lighting, mood, materials, animation/motion when relevant, and visual consistency. Do not mention policies or your process. Output only the final prompt. User language may be Indonesian. Target: ${mode}. Aspect ratio: ${aspect}. User idea: ${prompt}` }];
    for (const f of files.slice(0, 4)) {
      if (f.type.startsWith("image/")) inputs.push({ inlineData: { mimeType: f.type, data: Buffer.from(await f.arrayBuffer()).toString("base64") } });
    }
    const response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: inputs });
    return NextResponse.json({ prompt: response.text?.trim() || prompt });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Prompt engine error" }, { status: 500 });
  }
}
