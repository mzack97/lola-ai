import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, courseTeachers, enrollments, sections, users } from "@/db";
import { getUser } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";
import { enrollAction } from "@/app/actions/enroll";
import { CourseCover } from "@/components/Cards";
import { Avatar } from "@/components/Avatar";
import { Aurora, Parallax, Reveal, SplitHeadline, Stagger, StaggerItem } from "@/components/motion";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCourseBySlug((await params).slug);
  return { title: c?.title ?? "Kurs", description: c?.summary, openGraph: c?.coverUrl ? { images: [c.coverUrl] } : undefined };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, user] = await Promise.all([getCourseBySlug(slug), getUser()]);
  if (!c || (!c.published && user?.role !== "ADMIN")) notFound();
  const [mine, teachers, plan] = await Promise.all([
    user ? db.select().from(enrollments).where(and(eq(enrollments.courseId, c.id), eq(enrollments.studentId, user.id))).limit(1).then((r) => r[0]) : undefined,
    db.select({ first: users.firstName, last: users.lastName, avatar: users.avatarUrl }).from(courseTeachers).innerJoin(users, eq(users.id, courseTeachers.teacherId)).where(eq(courseTeachers.courseId, c.id)),
    db.select({ title: sections.title }).from(sections).where(and(eq(sections.courseId, c.id), eq(sections.visible, true))).orderBy(asc(sections.order)),
  ]);
  const full = c.approved >= c.capacity;
  const left = Math.max(0, c.capacity - c.approved);

  let action: React.ReactNode;
  if (!user) action = <Link href={`/royxat?next=/kurslar/${c.slug}`} className="btn-primary w-full py-4 text-base">Ro‘yxatdan o‘tish va ariza qoldirish</Link>;
  else if (user.role !== "STUDENT") action = <Link href={`/xona/${c.id}`} className="btn-dark w-full py-4">Kurs xonasini ochish</Link>;
  else if (mine?.status === "APPROVED") action = <Link href={`/xona/${c.id}`} className="btn-primary w-full py-4 text-base">Kurs xonasiga o‘tish →</Link>;
  else if (mine?.status === "PENDING") action = <div className="rounded-2xl bg-cream/80 p-4 text-center text-sm font-bold">⏳ Arizangiz ko‘rib chiqilmoqda. Ustoz tasdiqlagach kurs xonasi ochiladi.</div>;
  else if (mine?.status === "REJECTED") action = <div className="rounded-2xl bg-white/60 p-4 text-center text-sm font-bold text-muted">Bu kurs uchun arizangiz qabul qilinmadi.</div>;
  else if (full) action = <div className="rounded-2xl bg-white/60 p-4 text-center text-sm font-bold text-muted">Guruh to‘lgan. Keyingi guruhni kuting.</div>;
  else action = <form action={enrollAction}><input type="hidden" name="courseId" value={c.id} /><button className="btn-primary w-full py-4 text-base">Kursga ariza qoldirish →</button></form>;

  const t = c.title.split(" ");
  return (
    <div className="relative pb-10 pt-28">
      <Aurora variant="warm" className="h-[90vh]" />
      <div className="container-x">
        <Reveal><Link href="/kurslar" className="btn-ghost btn-sm">← Kurslar</Link></Reveal>
        <div className="mt-8 max-w-4xl">
          {c.category && <Reveal><div className="kicker mb-5"><span className="h-1.5 w-1.5 rounded-full bg-orange" />{c.category}</div></Reveal>}
          <SplitHeadline className="display text-[clamp(2.6rem,6.5vw,5.4rem)]" parts={t.length > 1 ? [{ t: t.slice(0, -1).join(" ") }, { t: t[t.length - 1], accent: true }] : [{ t: c.title }]} />
          {c.summary && <Reveal delay={0.3}><p className="mt-6 max-w-2xl text-xl leading-8 text-ink-2">{c.summary}</p></Reveal>}
        </div>

        <Reveal delay={0.2} className="mt-12">
          <div className="relative aspect-[21/9] overflow-hidden rounded-[36px] shadow-[0_40px_80px_-40px_rgba(60,30,10,.5)]">
            <Parallax speed={40} className="absolute inset-[-8%]"><CourseCover c={c} /></Parallax>
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2 sm:inset-x-6 sm:bottom-6">
              {[["Format", c.format], ["Boshlanish", c.startDate ? fmtDate(c.startDate) : "E’lon qilinadi"], ["Jadval", c.schedule || "E’lon qilinadi"], ["Joylar", `${left} ta bo‘sh`]].map(([k, v]) => (
                <div key={k} className="glass rounded-2xl px-4 py-2.5"><div className="text-[10px] font-bold uppercase tracking-wider text-muted">{k}</div><div className="text-sm font-bold">{v}</div></div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-12">
            {c.description && <Reveal><h2 className="display mb-5 text-3xl">Kurs haqida</h2><div className="prose-lola">{c.description}</div></Reveal>}
            {plan.length > 0 && (
              <div>
                <Reveal><h2 className="display mb-5 text-3xl">O‘quv reja</h2></Reveal>
                <Stagger className="space-y-3">
                  {plan.map((p, i) => (
                    <StaggerItem key={i}>
                      <div className="card flex items-center gap-4 !rounded-2xl p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-sm font-bold text-white">{String(i + 1).padStart(2, "0")}</span><span className="font-semibold">{p.title}</span></div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            )}
            {teachers.length > 0 && (
              <Reveal>
                <h2 className="display mb-5 text-3xl">Ustoz{teachers.length > 1 ? "lar" : ""}</h2>
                <div className="flex flex-wrap gap-4">
                  {teachers.map((tc, i) => (
                    <div key={i} className="card flex items-center gap-4 !rounded-3xl py-4 pl-4 pr-8"><Avatar src={tc.avatar} name={`${tc.first} ${tc.last}`} size={56} /><div><div className="font-display text-lg font-bold">{tc.first} {tc.last}</div><div className="text-xs text-muted">Kurs ustozi</div></div></div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={0.2}>
              <div className="card p-7">
                <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-orange">Qabul</div>
                <div className="display mt-2 text-4xl">{full ? "Guruh to‘lgan" : `${left} ta joy`}</div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-gradient-to-r from-orange to-peach" style={{ width: `${Math.min(100, (c.approved / c.capacity) * 100)}%` }} /></div>
                <p className="mt-3 text-xs text-muted">{c.approved} / {c.capacity} o‘rin band · bepul ariza</p>
                <div className="mt-6">{action}</div>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
