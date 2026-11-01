"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { AnimatePresence, motion } from "motion/react";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 10;

type Props = {
  name: string;
  aspect: number; // 16/9 for covers, 1 for avatars
  outWidth: number; // final pixel width
  current?: string | null;
  round?: boolean;
  label?: string;
  hint?: string;
  preview?: "card" | "avatar" | "plain";
};

async function cropToBlob(src: string, area: Area, outW: number, aspect: number) {
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const outH = Math.round(outW / aspect);
  const c = document.createElement("canvas");
  c.width = outW; c.height = outH;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outW, outH);
  return new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.88));
}

export function ImageCropInput({ name, aspect, outWidth, current, round, label = "Rasm", hint, preview = "plain" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!TYPES.includes(f.type)) return setErr("Faqat JPG, PNG yoki WEBP rasm yuklang.");
    if (f.size > MAX_MB * 1024 * 1024) return setErr(`Rasm juda katta: maksimum ${MAX_MB} MB.`);
    setErr(""); setZoom(1); setCrop({ x: 0, y: 0 });
    setSrc(URL.createObjectURL(f));
  }
  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  async function apply() {
    if (!src || !area) return;
    setBusy(true);
    const blob = await cropToBlob(src, area, outWidth, aspect);
    const file = new File([blob], `image-${Date.now()}.jpg`, { type: "image/jpeg" });
    const dt = new DataTransfer(); dt.items.add(file);
    hiddenRef.current!.files = dt.files;
    setResult(URL.createObjectURL(blob));
    setSrc(null); setBusy(false);
  }
  function clear() {
    setResult(null);
    if (hiddenRef.current) hiddenRef.current.value = "";
  }

  const shown = result || current;
  return (
    <div>
      <div className="label">{label}</div>
      <input ref={hiddenRef} type="file" name={name} className="hidden" tabIndex={-1} />
      <input ref={fileRef} type="file" accept={TYPES.join(",")} onChange={pick} className="hidden" />
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()}
          className={`group relative overflow-hidden border-2 border-dashed border-ink/15 bg-white/50 transition hover:border-orange ${round ? "h-24 w-24 rounded-full" : "aspect-video w-56 rounded-2xl"}`}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-1 text-xs font-bold text-muted"><span className="text-2xl">＋</span>Tanlash</span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">{shown ? "Almashtirish" : "Tanlash"}</span>
        </button>
        <div className="text-xs leading-5 text-muted">
          <div>Fayl turi: <b>JPG, PNG, WEBP</b> · maksimum <b>{MAX_MB} MB</b></div>
          <div>{hint ?? `Tanlagandan so‘ng kesib, joylashuvini sozlaysiz (${aspect === 1 ? "kvadrat" : "16:9"}).`}</div>
          {result && <button type="button" onClick={clear} className="mt-1 font-bold text-orange">Bekor qilish</button>}
          {err && <div className="mt-1 font-bold text-red-600">{err}</div>}
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {src && (
          <motion.div data-lenis-prevent initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="glass w-full max-w-3xl overflow-hidden rounded-[28px] bg-white/80">
              <div className="flex items-center justify-between px-6 pt-5">
                <div>
                  <div className="display text-2xl">Rasmni sozlang</div>
                  <div className="text-xs text-muted">Sudrab joylashtiring, g‘ildirak yoki slayder bilan kattalashtiring</div>
                </div>
                <button type="button" onClick={() => setSrc(null)} className="btn-ghost btn-sm">✕</button>
              </div>
              <div className="grid gap-5 p-6 md:grid-cols-[1fr_220px]">
                <div className="relative h-[340px] overflow-hidden rounded-2xl bg-ink">
                  <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect} cropShape={round ? "round" : "rect"} showGrid={!round}
                    onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="label">Kattalashtirish</div>
                    <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full accent-orange" />
                  </div>
                  {preview !== "plain" && (
                    <div>
                      <div className="label">Saytda shunday ko‘rinadi</div>
                      <LivePreview src={src} area={area} aspect={aspect} kind={preview} />
                    </div>
                  )}
                  <div className="mt-auto flex gap-2">
                    <button type="button" onClick={() => setSrc(null)} className="btn-ghost flex-1">Bekor</button>
                    <button type="button" disabled={busy || !area} onClick={apply} className="btn-primary flex-1">{busy ? "…" : "Tayyor"}</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}

/** Small live preview: the cropped area drawn into a card / avatar shape. */
function LivePreview({ src, area, aspect, kind }: { src: string; area: Area | null; aspect: number; kind: "card" | "avatar" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!area) return;
    const img = new Image();
    img.onload = () => {
      const c = ref.current; if (!c) return;
      const w = 400, h = Math.round(w / aspect);
      c.width = w; c.height = h;
      c.getContext("2d")!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
    };
    img.src = src;
  }, [src, area, aspect]);
  if (kind === "avatar") return <canvas ref={ref} className="mx-auto h-24 w-24 rounded-full ring-4 ring-white" />;
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
      <canvas ref={ref} className="aspect-video w-full" />
      <div className="space-y-1.5 p-3">
        <div className="h-2 w-12 rounded bg-orange/70" />
        <div className="h-3 w-32 rounded bg-ink/80" />
        <div className="h-2 w-24 rounded bg-ink/20" />
      </div>
    </div>
  );
}
