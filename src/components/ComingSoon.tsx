import Link from "next/link";
import { getBlocks } from "@/lib/content";
import { Aurora, Marquee, Reveal, SplitHeadline, Stagger, StaggerItem } from "./motion";

const FEATURES = {
  freelance: [["Buyurtmalar", "Mijozlardan real loyihalar"], ["Portfolio", "Ishlaringizni ko‘rsating"], ["Xavfsiz to‘lov", "Ish tugagach to‘lov"], ["Reyting", "Sharhlar va ishonch"]],
  marketplace: [["Do‘kon", "O‘z mahsulotlaringiz vitrinasi"], ["Qo‘l mehnati", "Hunarmandchilik buyumlari"], ["Raqamli mahsulot", "Shablon, dizayn, kurslar"], ["Yetkazish", "Viloyat bo‘ylab"]],
} as const;

export async function ComingSoon({ k }: { k: "freelance" | "marketplace" }) {
  const b = (await getBlocks())[k];
  const dark = k === "freelance";
  return (
    <div className={`relative -mb-32 overflow-hidden pb-40 pt-36 ${dark ? "bg-ink text-white" : ""}`}>
      <Aurora variant={dark ? "night" : "sunset"} />
      <div className="container-x relative">
        <Reveal><span className="chip bg-orange px-4 py-1.5 text-white ring-0">● Tez kunda</span></Reveal>
        <SplitHeadline delay={0.1} className="display mt-8 text-[clamp(4rem,14vw,11rem)] leading-[.85]" parts={[{ t: b.title }]} />
        <Reveal delay={0.4}><p className={`mt-8 max-w-xl text-xl leading-8 ${dark ? "text-white/65" : "text-ink-2"}`}>{b.text}</p></Reveal>
        <Reveal delay={0.5}><p className={`mt-3 font-mono text-sm ${dark ? "text-white/40" : "text-muted"}`}>&gt; bo‘lim ishlab chiqilmoqda<span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-orange" /></p></Reveal>
        <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES[k].map(([t, d], i) => (
            <StaggerItem key={t}>
              <div className={`h-full rounded-[28px] p-6 ${dark ? "glass-dark" : "glass"}`}>
                <div className="font-mono text-xs text-orange">0{i + 1}</div>
                <div className="mt-8 font-display text-2xl font-bold">{t}</div>
                <div className={`mt-1 text-sm ${dark ? "text-white/55" : "text-muted"}`}>{d}</div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/kurslar" className="btn-primary px-7 py-4">Hozircha kurslarni ko‘ring →</Link>
            <Link href="/royxat" className={dark ? "btn border border-white/20 px-7 py-4 text-white hover:bg-white/10" : "btn-ghost px-7 py-4"}>Ro‘yxatdan o‘tish</Link>
          </div>
        </Reveal>
      </div>
      <div className={`mt-24 py-4 ${dark ? "border-y border-white/10" : "border-y border-ink/10"}`}>
        <Marquee items={Array.from({ length: 6 }, (_, i) => <span key={i} className="display flex items-center gap-10 text-6xl opacity-80">Tez kunda <span className="serif-accent text-orange">{b.title}</span></span>)} />
      </div>
    </div>
  );
}
