"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; text: string; pinned: boolean; createdAt: string; authorId: string; first: string; last: string; role: string };

const URL_RE = /(https?:\/\/[^\s]+)/g;
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_RE).map((p, i) =>
        /^https?:\/\//.test(p) ? (
          p.includes("meet.google.com") ? (
            <a key={i} href={p} target="_blank" rel="noreferrer" className="my-1 inline-flex items-center gap-2 rounded-full bg-orange px-3 py-1.5 text-xs font-bold text-white no-underline hover:bg-[#e8461a]">▶ Darsga qo‘shilish</a>
          ) : <a key={i} href={p} target="_blank" rel="noreferrer" className="break-all font-semibold text-orange underline">{p}</a>
        ) : <span key={i}>{p}</span>
      )}
    </>
  );
}

const time = (s: string) => new Intl.DateTimeFormat("uz-UZ", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

export function Chat({ sectionId, meId, canModerate }: { sectionId: string; meId: string; canModerate: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const lastRef = useRef<string | null>(null);
  const stick = useRef(true);

  useEffect(() => {
    let alive = true;
    setMsgs([]); lastRef.current = null; setLoaded(false);
    async function poll() {
      const q = lastRef.current ? `?after=${encodeURIComponent(lastRef.current)}` : "";
      const r = await fetch(`/api/chat/${sectionId}${q}`, { cache: "no-store" }).catch(() => null);
      if (!alive || !r?.ok) return;
      const { messages } = (await r.json()) as { messages: Msg[] };
      if (messages.length) {
        lastRef.current = messages[messages.length - 1].createdAt;
        setMsgs((old) => {
          const ids = new Set(old.map((m) => m.id));
          return [...old, ...messages.filter((m) => !ids.has(m.id))];
        });
      }
      setLoaded(true);
    }
    poll();
    const t = setInterval(poll, 4000);
    return () => { alive = false; clearInterval(t); };
  }, [sectionId]);

  useEffect(() => {
    if (stick.current && box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    const r = await fetch(`/api/chat/${sectionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }).catch(() => null);
    setSending(false);
    if (r?.ok) {
      const { message } = await r.json();
      setText(""); stick.current = true;
      lastRef.current = message.createdAt;
      setMsgs((old) => (old.some((m) => m.id === message.id) ? old : [...old, message]));
    }
  }

  async function remove(id: string) {
    if (!confirm("Xabarni o‘chirasizmi?")) return;
    await fetch(`/api/chat/${sectionId}?id=${id}`, { method: "DELETE" });
    setMsgs((old) => old.filter((m) => m.id !== id));
  }

  return (
    <div className="card flex h-[560px] flex-col overflow-hidden">
      <div ref={box} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
        className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(#fff,#fcfbfa)] p-4">
        {!loaded && <div className="text-center text-sm text-muted">Yuklanmoqda…</div>}
        {loaded && msgs.length === 0 && <div className="py-16 text-center text-sm text-muted">Hozircha xabarlar yo‘q. Birinchi bo‘lib yozing!</div>}
        {msgs.map((m) => {
          const mine = m.authorId === meId;
          const staff = m.role !== "STUDENT";
          return (
            <div key={m.id} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${mine ? "rounded-br-md bg-ink text-white" : staff ? "rounded-bl-md border border-orange/30 bg-cream" : "rounded-bl-md bg-[#f3efeb]"}`}>
                <div className={`mb-0.5 flex items-center gap-2 text-[11px] font-bold ${mine ? "text-white/60" : "text-muted"}`}>
                  <span>{m.first} {m.last}</span>
                  {staff && <span className="rounded bg-orange px-1.5 text-[10px] text-white">{m.role === "ADMIN" ? "Admin" : "Ustoz"}</span>}
                  <span className="font-mono font-medium">{time(m.createdAt)}</span>
                  {(mine || canModerate) && <button onClick={() => remove(m.id)} className="opacity-0 transition group-hover:opacity-100 hover:text-red-500">✕</button>}
                </div>
                <div className="whitespace-pre-wrap break-words"><Linkified text={m.text} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-line bg-white p-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Xabar yozing…"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
          className="input min-h-[44px] resize-none" />
        <button disabled={sending || !text.trim()} className="btn-primary shrink-0">Yuborish</button>
      </form>
    </div>
  );
}
