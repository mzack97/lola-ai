import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, news } from "@/db";
import { AdminHead, Flash } from "@/components/AdminUi";
import { fmtDate } from "@/lib/utils";

export default async function AdminNews({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const list = await db.select().from(news).orderBy(desc(news.createdAt));
  return (
    <div>
      <AdminHead title="Yangiliklar" action={<Link href="/admin/yangiliklar/yangi" className="btn-primary">+ Yangi xabar</Link>} />
      <Flash sp={await searchParams} />
      <div className="card divide-y divide-line">
        {list.map((n) => (
          <Link key={n.id} href={`/admin/yangiliklar/${n.id}`} className="flex flex-wrap items-center gap-4 p-4 hover:bg-paper">
            <div className="min-w-0 flex-1 font-bold">{n.title}</div>
            <span className="text-xs text-muted">{fmtDate(n.publishedAt ?? n.createdAt)}</span>
            {n.published ? <span className="chip bg-green-100 text-green-800">Nashr etilgan</span> : <span className="chip">Qoralama</span>}
          </Link>
        ))}
        {list.length === 0 && <div className="p-8 text-center text-sm text-muted">Hali xabar yo‘q.</div>}
      </div>
    </div>
  );
}
