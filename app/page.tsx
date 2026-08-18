"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "image" | "video";
type Result = { kind: "image" | "video"; url: string; prompt?: string };

const examples = [
  "Seekor kucing oren kecil berjalan di desa Jepang saat hujan, suasana hangat dan sinematik, kamera mengikuti dari belakang.",
  "Seorang gadis berdiri di bawah pohon sakura saat kelopak bunga beterbangan, magical cinematic animation, slow camera push-in.",
  "Kota futuristik di malam hari setelah hujan, neon memantul di jalan basah, kamera bergerak perlahan di antara gedung tinggi."
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [negative, setNegative] = useState("blurry, low quality, distorted, extra fingers, inconsistent character");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [enhanced, setEnhanced] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Result[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("creator-history") || "[]")); } catch {}
  }, []);

  const addHistory = (r: Result) => {
    const next = [r, ...history].slice(0, 8);
    setHistory(next);
    localStorage.setItem("creator-history", JSON.stringify(next));
  };

  async function enhance() {
    if (!prompt.trim()) return;
    setBusy(true); setError(""); setStatus("AI sedang memahami prompt...");
    try {
      const body = new FormData();
      body.append("prompt", prompt);
      body.append("mode", mode);
      body.append("aspectRatio", aspect);
      for (const f of files) body.append("files", f);
      const res = await fetch("/api/prompt", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prompt gagal diproses");
      setEnhanced(data.prompt);
      setStatus("Prompt siap.");
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan"); setStatus(""); }
    finally { setBusy(false); }
  }

  async function generate() {
    if (!prompt.trim() && !enhanced.trim()) return;
    setBusy(true); setError(""); setResult(null);
    try {
      let finalPrompt = enhanced || prompt;
      if (!enhanced) {
        setStatus("AI sedang memahami prompt...");
        const p = new FormData(); p.append("prompt", prompt); p.append("mode", mode); p.append("aspectRatio", aspect);
        for (const f of files) p.append("files", f);
        const pr = await fetch("/api/prompt", { method: "POST", body: p });
        const pd = await pr.json(); if (!pr.ok) throw new Error(pd.error || "Prompt gagal diproses");
        finalPrompt = pd.prompt; setEnhanced(finalPrompt);
      }

      if (mode === "image") {
        setStatus("Membuat gambar...");
        const body = new FormData(); body.append("prompt", finalPrompt); body.append("aspectRatio", aspect);
        for (const f of files) body.append("files", f);
        const res = await fetch("/api/image", { method: "POST", body });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Gagal membuat gambar"); }
        const blob = await res.blob(); const url = URL.createObjectURL(blob);
        const r: Result = { kind: "image", url, prompt: finalPrompt }; setResult(r); addHistory(r); setStatus("Selesai.");
      } else {
        setStatus("Memulai pembuatan video... (biasanya perlu beberapa menit)");
        const body = new FormData(); body.append("prompt", finalPrompt); body.append("aspectRatio", aspect); body.append("negativePrompt", negative);
        for (const f of files) body.append("files", f);
        const res = await fetch("/api/video", { method: "POST", body });
        const d = await res.json(); if (!res.ok) throw new Error(d.error || "Gagal memulai video");
        let op = d.operation;
        while (true) {
          await new Promise(r => setTimeout(r, 8000));
          const sr = await fetch(`/api/video/status?operation=${encodeURIComponent(op)}`);
          const sd = await sr.json();
          if (!sr.ok) throw new Error(sd.error || "Status video gagal");
          if (!sd.done) { setStatus(sd.message || "Video masih dibuat..."); continue; }
          const vr = await fetch(`/api/video/status?operation=${encodeURIComponent(op)}&download=1`);
          if (!vr.ok) { const vd = await vr.json().catch(() => ({})); throw new Error(vd.error || "Video siap tapi gagal diambil"); }
          const blob = await vr.blob(); const url = URL.createObjectURL(blob);
          const r: Result = { kind: "video", url, prompt: finalPrompt }; setResult(r); addHistory(r); setStatus("Video selesai."); break;
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan"); setStatus(""); }
    finally { setBusy(false); }
  }

  const download = () => {
    if (!result) return;
    const a = document.createElement("a"); a.href = result.url; a.download = result.kind === "image" ? "creator-ai.png" : "creator-ai.mp4"; a.click();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="logo">✦</span><div><strong>Creator AI</strong><small>Creative Studio</small></div></div>
        <div className="top-actions"><button className="ghost">Projects</button><button className="avatar">K</button></div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <button className="new-project" onClick={() => { setPrompt(""); setEnhanced(""); setFiles([]); setResult(null); setError(""); }}>＋ New project</button>
          <div className="side-label">CREATE</div>
          <button className={mode === "image" ? "side-btn active" : "side-btn"} onClick={() => setMode("image")}>▧ <span>Image</span></button>
          <button className={mode === "video" ? "side-btn active" : "side-btn"} onClick={() => setMode("video")}>▶ <span>Video</span></button>
          <div className="side-label">RECENT</div>
          {history.slice(0, 5).map((h, i) => <button key={i} className="history-item" onClick={() => setResult(h)}><span>{h.kind === "image" ? "▧" : "▶"}</span> {h.prompt?.slice(0, 25) || "Untitled"}</button>)}
        </aside>

        <section className="main-panel">
          <div className="canvas-head"><div><span className="eyebrow">AI GENERATOR</span><h1>{mode === "image" ? "Create an image" : "Create a video"}</h1></div><div className="pill">Gemini + {mode === "image" ? "Nano Banana" : "Veo"}</div></div>

          <div className="canvas">
            {result ? (result.kind === "image" ? <img src={result.url} alt="Generated result" /> : <video src={result.url} controls autoPlay loop />) : <div className="empty"><div className="empty-icon">✦</div><h2>Bring your idea to life</h2><p>Write a prompt, add references if you want, then generate.</p></div>}
          </div>

          <div className="composer">
            <div className="attachments">
              {files.map((f, i) => <div className="file-chip" key={i}>{f.type.startsWith("video") ? "🎬" : "🖼️"} {f.name.slice(0, 18)} <button onClick={() => setFiles(files.filter((_, x) => x !== i))}>×</button></div>)}
            </div>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe what you want to create..." />
            <div className="composer-row">
              <div className="left-tools"><button className="tool" onClick={() => fileRef.current?.click()}>＋ Reference</button><input ref={fileRef} hidden type="file" accept="image/*,video/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} /><select value={aspect} onChange={e => setAspect(e.target.value)}><option>9:16</option><option>16:9</option><option>1:1</option><option>4:3</option><option>3:4</option></select></div>
              <button className="generate" disabled={busy || (!prompt.trim() && !enhanced.trim())} onClick={generate}>{busy ? "Generating…" : "Generate ✦"}</button>
            </div>
          </div>

          <div className="below">
            <div className="examples"><span>Try:</span>{examples.map((x, i) => <button key={i} onClick={() => setPrompt(x)}>{x.slice(0, 54)}…</button>)}</div>
            {mode === "video" && <label className="negative">Negative prompt<input value={negative} onChange={e => setNegative(e.target.value)} /></label>}
            {enhanced && <details><summary>AI prompt yang dipakai</summary><p>{enhanced}</p></details>}
            {(status || error) && <div className={error ? "notice error" : "notice"}>{error || status}</div>}
            {result && <button className="download" onClick={download}>↓ Download {result.kind}</button>}
          </div>
        </section>
      </section>
    </main>
  );
}
