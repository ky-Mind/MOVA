import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const operationName = searchParams.get("operation");
    const download = searchParams.get("download") === "1";
    if (!operationName) return NextResponse.json({ error: "Operation kosong." }, { status: 400 });
    const ai = gemini();
    let operation: any = { name: operationName };
    operation = await ai.operations.getVideosOperation({ operation });
    if (!operation.done) return NextResponse.json({ done: false, message: "Video masih diproses..." });
    if (operation.error) return NextResponse.json({ error: operation.error.message || "Video generation gagal." }, { status: 500 });
    const video = operation.response?.generatedVideos?.[0]?.video;
    if (!video) return NextResponse.json({ error: "Video tidak ditemukan." }, { status: 500 });
    if (!download) return NextResponse.json({ done: true });
    const filePath = path.join("/tmp", `creator-${Date.now()}.mp4`);
    await ai.files.download({ file: video, downloadPath: filePath });
    const data = await fs.readFile(filePath);
    await fs.unlink(filePath).catch(() => {});
    return new Response(data, { headers: { "Content-Type": "video/mp4", "Content-Disposition": "attachment; filename=creator-ai.mp4", "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Video status error" }, { status: 500 });
  }
}
