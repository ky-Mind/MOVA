import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const prompt = String(form.get("prompt") || "").trim();
    const aspect = String(form.get("aspectRatio") || "9:16");
    const files = form.getAll("files").filter((x): x is File => x instanceof File);
    if (!prompt) return NextResponse.json({ error: "Prompt kosong." }, { status: 400 });
    const ai = gemini();
    const input: any[] = [{ type: "text", text: prompt }];
    for (const f of files.slice(0, 6)) {
      if (f.type.startsWith("image/")) input.push({ type: "image", data: Buffer.from(await f.arrayBuffer()).toString("base64"), mime_type: f.type });
    }
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input,
      response_format: { type: "image", mime_type: "image/png", aspect_ratio: aspect, image_size: "1K" },
    });
    const data = interaction.output_image?.data;
    if (!data) throw new Error("Model tidak mengembalikan gambar.");
    return new Response(Buffer.from(data, "base64"), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Image generation error" }, { status: 500 });
  }
}
