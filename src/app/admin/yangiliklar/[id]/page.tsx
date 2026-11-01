import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, news } from "@/db";
import { deleteNews } from "@/app/actions/admin";
import { AdminHead, Back, ConfirmButton, Flash } from "@/components/AdminUi";
import { NewsForm } from "@/components/NewsForm";

export default async function EditNews({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { id } = await params;
  const [n] = await db.select().from(news).where(eq(news.id, id));
  if (!n) notFound();
  return (
    <div>
      <Back href="/admin/yangiliklar" label="Yangiliklar" />
      <AdminHead title={n.title} action={<div className="flex items-start gap-2">{n.published && <Link href={`/yangiliklar/${n.slug}`} className="btn-ghost btn-sm">Saytda ko‘rish</Link>}<form action={deleteNews}><input type="hidden" name="id" value={n.id} /><ConfirmButton>O‘chirish</ConfirmButton></form></div>} />
      <Flash sp={await searchParams} />
      <NewsForm n={n} />
    </div>
  );
}
