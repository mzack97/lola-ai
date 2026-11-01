import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, enrollments } from "@/db";
import { getUser } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";
import { enrollAction } from "@/app/actions/enroll";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCourseBySlug((await params).slug);
  return { title: c?.title ?? "Kurs", description: c?.summary };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, user] = await Promise.all([getCourseBySlug(slug), getUser()]);
  if (!c || (!c.published && user?.role !== "ADMIN")) notFound();
  const mine = user
    ? (await db.select().from(enrollments).where(and(eq(enrollments.courseId, c.id), eq(enrollments.studentId, user.id))).limit(1))[0]
    : undefined;
  const full = c.approved >= c.capacity;

  let action: React.ReactNode;
  if (!user) action = <Link href={`/royxat?next=/kurslar/${c.slug}`} className="btn-primary w-full py-3.5 text-base">Ro‘yxatdan o‘tish va ariza qoldirish</Link>;
  else if (user.role !== "STUDENT") action = <Link href={`/xona/${c.id}`} className="btn-dark w-full py-3.5">Kurs xonasini ochish</Link>;
  else if (mine?.status === "APPROVED") action = <Link href={`/xona/${c.id}`} className="btn-primary w-full py-3.5 text-base">Kurs xonasiga o‘tish →</Link>;
  else if (mine?.status === "PENDING") action = <div className="rounded-2xl bg-cream p-4 text-center text-sm font-bold">Arizangiz ko‘rib chiqilmoqda. Ustoz tasdiqlagach kurs xonasi ochiladi.</div>;
  else if (mine?.status === "REJECTED") action = <div className="rounded-2xl bg-[#f3efeb] p-4 text-center text-sm font-bold text-muted">Bu kurs uchun arizangiz qabul qilinmadi.</div>;
  else if (full) action = <div className="rounded-2xl bg-[#f3efeb] p-4 text-center text-sm font-bold text-muted">Guruh to‘lgan. Keyingi guruhni kuting.</div>;
  else action = (
    <form action={enrollAction}>
      <input type="hidden" name="courseId" value={c.id} />
      <button className="btn-primary w-full py-3.5 text-base">Kursga ariza qoldirish</button>
    </form>
  );

  return (
    <div className="container-x py-14">
      <Link href="/kurslar" className="text-sm font-semibold text-muted hover:text-orange">← Kurslar</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {c.category && <div className="kicker mb-3">{c.category}</div>}
          <h1 className="h-title">{c.title}</h1>
          {c.summary && <p className="mt-4 text-lg text-ink-2">{c.summary}</p>}
          {c.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.coverUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
          )}
          {c.description && <div className="prose-lola mt-8">{c.description}</div>}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-6">
            <Row k="Format" v={c.format} />
            {c.startDate && <Row k="Boshlanish" v={fmtDate(c.startDate)} />}
            {c.schedule && <Row k="Jadval" v={c.schedule} />}
            {c.teachers.length > 0 && <Row k="Ustoz" v={c.teachers.join(", ")} />}
            <Row k="Joylar" v={`${Math.max(0, c.capacity - c.approved)} / ${c.capacity}`} />
            <div className="pt-2">{action}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3 text-sm last:border-0">
      <span className="text-muted">{k}</span><span className="text-right font-bold">{v}</span>
    </div>
  );
}
