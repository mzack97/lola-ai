import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, news } from "@/db";
import { fmtDate } from "@/lib/utils";

async function get(slug: string) {
  const [n] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  return n?.published ? n : null;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const n = await get((await params).slug);
  return { title: n?.title ?? "Yangilik", description: n?.excerpt };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const n = await get((await params).slug);
  if (!n) notFound();
  return (
    <article className="container-x max-w-3xl py-14">
      <Link href="/yangiliklar" className="text-sm font-semibold text-muted hover:text-orange">← Yangiliklar</Link>
      <div className="mt-6 font-mono text-xs text-muted">{fmtDate(n.publishedAt)}</div>
      <h1 className="mt-2 h-title">{n.title}</h1>
      {n.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.coverUrl} alt="" className="mt-8 w-full rounded-2xl object-cover" />
      )}
      {n.excerpt && <p className="mt-8 text-lg font-semibold text-ink-2">{n.excerpt}</p>}
      <div className="prose-lola mt-6">{n.body}</div>
    </article>
  );
}
