import Link from "next/link";
import { fmtDate } from "@/lib/utils";
import type { CourseCardData } from "@/lib/queries";

const GRADS = ["from-[#ff531e] to-[#ff9a6b]", "from-[#121212] to-[#3a3a3a]", "from-[#f4c9a8] to-[#fbebdd]", "from-[#ff7a45] to-[#121212]"];

export function CourseCard({ c }: { c: Omit<CourseCardData, "category"> & { category: string | null } }) {
  const g = GRADS[c.title.length % GRADS.length];
  const full = c.approved >= c.capacity;
  return (
    <Link href={`/kurslar/${c.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(18,18,18,.25)]">
      <div className={`relative aspect-[16/9] bg-gradient-to-br ${g}`}>
        {c.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-end p-5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white/80 mix-blend-difference">{c.category ?? "Kurs"}</span>
          </div>
        )}
        {full && <span className="absolute right-3 top-3 chip bg-white">Guruh to‘lgan</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {c.category && <span className="kicker mb-2">{c.category}</span>}
        <h3 className="text-lg font-extrabold leading-snug group-hover:text-orange">{c.title}</h3>
        {c.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.summary}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-4 text-xs">
          <span className="chip">{c.format}</span>
          {c.startDate && <span className="chip">Boshlanish: {fmtDate(c.startDate)}</span>}
        </div>
        {c.teachers.length > 0 && <div className="mt-3 text-xs font-semibold text-muted">Ustoz: {c.teachers.join(", ")}</div>}
      </div>
    </Link>
  );
}

export function NewsCard({ n }: { n: { slug: string; title: string; excerpt: string; coverUrl: string | null; publishedAt: Date | null } }) {
  return (
    <Link href={`/yangiliklar/${n.slug}`} className="card group overflow-hidden transition hover:-translate-y-1">
      <div className="aspect-[16/10] bg-cream">
        {n.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs font-bold tracking-widest text-orange/60">LOLA AI · YANGILIK</div>
        )}
      </div>
      <div className="p-5">
        <div className="font-mono text-xs text-muted">{fmtDate(n.publishedAt)}</div>
        <h3 className="mt-2 font-extrabold leading-snug group-hover:text-orange">{n.title}</h3>
        {n.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{n.excerpt}</p>}
      </div>
    </Link>
  );
}

export function SectionHead({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="kicker mb-3">{kicker}</div>
        <h2 className="h-title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card border-dashed p-10 text-center text-sm text-muted">{children}</div>;
}
