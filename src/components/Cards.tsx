import Link from "next/link";
import { fmtDate, scheduleText, startText } from "@/lib/utils";

export type CourseCardData = {
  id: string; title: string; slug: string; summary: string; coverUrl: string | null; format: string;
  startDate: Date | null; schedule: string; capacity: number; category: string | null; teachers: string[]; approved: number;
};

const ARTS = [
  "from-[#ff531e] via-[#ff8a5c] to-[#ffd2b8]",
  "from-[#121212] via-[#3b2418] to-[#ff531e]",
  "from-[#ffb38a] via-[#fbebdd] to-[#e9d9ff]",
  "from-[#ff7a45] via-[#c24a1a] to-[#121212]",
  "from-[#fbebdd] via-[#ffc7a8] to-[#ff7a45]",
];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function CourseCover({ c, className = "" }: { c: { title: string; coverUrl: string | null; category: string | null }; className?: string }) {
  if (c.coverUrl)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={c.coverUrl} alt="" className={`h-full w-full object-cover ${className}`} />;
  const h = hash(c.title);
  const dark = h % ARTS.length === 1 || h % ARTS.length === 3;
  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${ARTS[h % ARTS.length]} ${className}`}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute -bottom-16 -left-6 h-48 w-48 rounded-full border border-white/40" />
      <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full border border-white/25" />
      <div className={`display absolute bottom-3 left-4 right-4 truncate text-[44px] leading-none ${dark ? "text-white/90" : "text-ink/85"}`}>{(c.category ?? c.title).split(" ")[0]}</div>
    </div>
  );
}

export function CourseCard({ c }: { c: CourseCardData }) {
  const full = c.approved >= c.capacity;
  return (
    <Link href={`/kurslar/${c.slug}`} className="card group flex h-full flex-col overflow-hidden p-2 transition duration-500 hover:-translate-y-1.5">
      <div className="relative aspect-video overflow-hidden rounded-[22px]">
        <CourseCover c={c} className="transition duration-700 group-hover:scale-[1.06]" />
        <div className="absolute left-3 top-3 flex gap-2">
          {c.category && <span className="chip bg-white/75">{c.category}</span>}
        </div>
        {full && <span className="chip absolute right-3 top-3 bg-ink text-white ring-0">Guruh to‘lgan</span>}
        <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white text-lg opacity-0 shadow-lg transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">↗</span>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight group-hover:text-orange">{c.title}</h3>
        {c.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.summary}</p>}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5 text-xs">
          <div className="rounded-2xl bg-white/55 px-3 py-2 ring-1 ring-white/70"><div className="text-[10px] font-bold uppercase tracking-wider text-muted">Boshlanish</div><div className="mt-0.5 font-bold">{c.startDate ? fmtDate(c.startDate) : "E’lon qilinadi"}</div></div>
          <div className="rounded-2xl bg-white/55 px-3 py-2 ring-1 ring-white/70"><div className="text-[10px] font-bold uppercase tracking-wider text-muted">Jadval</div><div className="mt-0.5 truncate font-bold">{c.schedule || "E’lon qilinadi"}</div></div>
        </div>
        {c.teachers.length > 0 && <div className="mt-3 text-xs font-semibold text-muted">Ustoz: <span className="text-ink">{c.teachers.join(", ")}</span></div>}
      </div>
    </Link>
  );
}

export function NewsCard({ n, big }: { n: { slug: string; title: string; excerpt: string; coverUrl: string | null; publishedAt: Date | null }; big?: boolean }) {
  return (
    <Link href={`/yangiliklar/${n.slug}`} className={`card group flex h-full flex-col overflow-hidden p-2 transition duration-500 hover:-translate-y-1.5 ${big ? "md:flex-row" : ""}`}>
      <div className={`relative overflow-hidden rounded-[22px] bg-cream ${big ? "aspect-video md:aspect-auto md:w-3/5" : "aspect-video"}`}>
        {n.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.coverUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        ) : <CourseCover c={{ title: n.title, coverUrl: null, category: "Yangilik" }} />}
      </div>
      <div className={`flex flex-col p-4 ${big ? "md:w-2/5 md:justify-end md:p-8" : ""}`}>
        <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-orange">{fmtDate(n.publishedAt)}</div>
        <h3 className={`mt-2 font-display font-bold leading-tight tracking-tight group-hover:text-orange ${big ? "text-3xl md:text-4xl" : "text-lg"}`}>{n.title}</h3>
        {n.excerpt && <p className={`mt-2 text-muted ${big ? "text-base" : "line-clamp-2 text-sm"}`}>{n.excerpt}</p>}
        <span className="mt-4 text-sm font-bold text-ink group-hover:text-orange">O‘qish →</span>
      </div>
    </Link>
  );
}

export function SectionHead({ kicker, title, accent, action, light }: { kicker: string; title: string; accent?: string; action?: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="kicker mb-4"><span className="h-1.5 w-1.5 rounded-full bg-orange" />{kicker}</div>
        <h2 className={`h-title max-w-3xl ${light ? "text-white" : ""}`}>{title} {accent && <span className="serif-accent text-orange">{accent}</span>}</h2>
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card p-12 text-center text-sm text-muted">{children}</div>;
}

export { scheduleText, startText };
