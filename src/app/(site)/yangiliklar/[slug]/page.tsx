import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, news } from "@/db";
import { fmtDate } from "@/lib/utils";
import { Aurora, Parallax, ProgressBar, Reveal, SplitHeadline } from "@/components/motion";

async function get(slug: string) {
  const [n] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  return n?.published ? n : null;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const n = await get((await params).slug);
  return { title: n?.title ?? "Yangilik", description: n?.excerpt, openGraph: n?.coverUrl ? { images: [n.coverUrl] } : undefined };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const n = await get((await params).slug);
  if (!n) notFound();
  return (
    <article className="relative pb-10 pt-32">
      <ProgressBar />
      <Aurora variant="warm" className="h-[70vh] opacity-70" />
      <div className="container-x max-w-4xl">
        <Reveal><Link href="/yangiliklar" className="btn-ghost btn-sm">← Yangiliklar</Link></Reveal>
        <Reveal delay={0.1}><div className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-orange">{fmtDate(n.publishedAt)}</div></Reveal>
        <SplitHeadline className="display mt-4 text-[clamp(2.4rem,5.5vw,4.4rem)]" parts={[{ t: n.title }]} />
        {n.excerpt && <Reveal delay={0.3}><p className="mt-6 text-xl leading-8 text-ink-2">{n.excerpt}</p></Reveal>}
      </div>
      {n.coverUrl && (
        <Reveal delay={0.2} className="container-x mt-12">
          <div className="relative aspect-video overflow-hidden rounded-[36px]">
            <Parallax speed={50} className="absolute inset-[-8%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.coverUrl} alt="" className="h-full w-full object-cover" />
            </Parallax>
          </div>
        </Reveal>
      )}
      <div className="container-x mt-12 max-w-3xl">
        <Reveal><div className="prose-lola text-[18px] leading-9">{n.body}</div></Reveal>
      </div>
    </article>
  );
}
